import Database from 'better-sqlite3';
import { access, readdir, readFile } from 'fs/promises';
import { constants } from 'fs';
import { resolve } from 'path';

import { yellow } from './text';
import { Logger } from './logger';
import { Msg } from './messages';
import { Sql } from './sql';
import type { DbCategory, DbTransaction, Transaction } from './types';

const registerExitHandlers = (db: Database, logger: Logger) => {
  process.on('exit', () => {
    try {
      db.close();
    } finally {
      logger.info('DB disconnected\n');
    }
  });
  process.on('SIGHUP', () => process.exit(128 + 1));
  process.on('SIGINT', () => process.exit(128 + 2));
  process.on('SIGTERM', () => process.exit(128 + 15));
};

export class Db {
  private db: Database | undefined;
  private filename: string;
  private logger: Logger;
  private migrationDir: string;

  constructor(filename: string, logger: Logger, migrationDir?: string) {
    this.db = undefined;
    this.filename = filename;
    this.logger = logger;
    this.migrationDir = migrationDir || resolve(__dirname, '..', 'migrations');
  }

  public async create(): Promise<void> {
    if (this.db) {
      this.logger.error(Msg.DB_ALREADY_CONNECTED);
    }
    try {
      await access(this.filename, constants.R_OK);
      this.logger.error(Msg.DB_ALREADY_EXISTS, this.filename);
    } catch {
      // pass
    }
    try {
      this.db = new Database(this.filename, this.logger);
      this.db.pragma('foreign_keys = ON');
      registerExitHandlers(this.db, this.logger);
    } catch {
      this.logger.error(Msg.DB_CANNOT_CREATE, this.filename);
    }
    // create migrations table
    try {
      const statement = this.db.prepare(Sql.CREATE_MIGRATIONS_TABLE);
      statement.run();
    } catch {
      this.logger.error(Msg.DB_MIGRATION_CREATE_FAIL);
    }
    this.logger.info(Msg.DB_MIGRATION_CREATE_SUCCESS);
    // run migrations
    await this.migrate();
  }

  private async migrate(): Promise<void> {
    const entries = await readdir(this.migrationDir, {withFileTypes: true});
    const filenames = entries.filter((f) => (f.isFile() && f.name.toString().endsWith('.sql'))).map((f) => (f.name.toString())).sort();
    let dbFilenames: string[];
    try {
      const statement = this.db.prepare(Sql.SELECT_MIGRATIONS);
      dbFilenames = statement.all().map((m) => (m.filename)).sort();
    } catch {
      this.logger.error(Msg.DB_SELECT_FAIL, 'migrations');
    }
    if (filenames.length < dbFilenames.length) {
      this.logger.error(Msg.MIGRATIONS_LENGTH, filenames.join(', '), dbFilenames.join(', '));
    }
    while (dbFilenames.length) {
      const fromDb = dbFilenames.shift();
      const fromDisk = filenames.shift();
      if (fromDb !== fromDisk) {
        this.logger.error(Msg.UNEXPECTED_MIGRATION, fromDb, fromDisk);
      }
    }
    if (!filenames.length) {
      return; // all migrations already applied
    }
    let migrations: Buffer[];
    try {
      migrations = await Promise.all(filenames.map((f) => readFile(resolve(this.migrationDir, f))));
    } catch {
      this.logger.error(Msg.MIGRATION_FILES_READ_FAIL, this.migrationDir);
    }
    const addMigration = this.db.prepare(Sql.INSERT_MIGRATION);
    const runMigrations = this.db.transaction((tuples) => {
      tuples.forEach(({filename, migration}) => {
        this.logger.info(Msg.MIGRATION_EXEC, filename);
        this.db.exec(migration.toString());
        const info = addMigration.run(filename);
        if (info.changes !== 1) {
          throw new Error('insert failed');
        }
      });
    });
    try {
      runMigrations(filenames.map((f, idx) => ({filename: f, migration: migrations[idx]})));
    } catch {
      this.logger.error(Msg.MIGRATION_FAIL);
    }
  }

  public async connect(): Promise<void> {
    if (this.db) {
      this.logger.error(Msg.DB_ALREADY_CONNECTED);
    }
    try {
      this.db = new Database(this.filename, {fileMustExist: true});
      this.db.pragma('foreign_keys = ON');
      registerExitHandlers(this.db, this.logger);
    } catch {
      this.logger.error(Msg.DB_CANNOT_CONNECT, this.filename);
    }
    this.logger.info(Msg.DB_CONNECTED, this.filename);
    // run migrations
    await this.migrate();
  }

  private getCategories(): DbCategory[] {
    try {
      const statement = this.db.prepare(Sql.SELECT_CATEGORIES);
      return statement.all();
    } catch {
      this.logger.error(Msg.DB_SELECT_FAIL, 'categories');
    }
  }

  private getCategoriesByName(): Record<string, number> {
    return this.getCategories().reduce((acc, {id, name}) => {
      acc[name] = id;
      return acc;
    }, {});
  }

  private getCategoriesById(): Record<number, string> {
    return this.getCategories().reduce((acc, {id, name}) => {
      acc[id] = name;
      return acc;
    }, {});
  }

  public import(transactions: Transaction[]): void {
    if (!this.db) {
      this.logger.error(Msg.DB_NOT_CONNECTED);
    }
    const dbCategories = this.getCategoriesByName();
    const addCategory = this.db.prepare(Sql.INSERT_CATEGORY);
    const addTransaction = this.db.prepare(Sql.INSERT_TRANSACTION);
    const importTransactions = this.db.transaction((trans) => {
      let newCategories = 0;
      const categSet = new Set<string>();
      trans.forEach(({category, amount, date}, idx) => {
        categSet.add(category);
        if (!(category in dbCategories)) {
          const res = addCategory.get(category);
          dbCategories[category] = res.id;
          newCategories += 1;
        }
        const catId = dbCategories[category];
        addTransaction.run(catId, date, amount);
        if ((((idx + 1) % 10) === 0) && (idx + 1 !== trans.length)) {
          this.logger.info(Msg.DB_TRANSACTIONS_INSERTED, yellow(idx + 1), yellow(categSet.size), yellow(newCategories), '...');
        }
      });
      this.logger.info(Msg.DB_TRANSACTIONS_INSERTED, yellow(trans.length), yellow(categSet.size), yellow(newCategories), '');
    });
    try {
      importTransactions(transactions);
    } catch {
      this.logger.error(Msg.CSV_IMPORT_FAIL);
    }
  }

  private getTransactions(count: number, categoryId?: number, untilDate?: string, ordered?: boolean): DbTransaction[] {
    try {
      if (typeof untilDate === 'string') {
        if (typeof categoryId === 'number') {
          if (count === 0) {
            const statement = this.db.prepare(ordered ? Sql.SELECT_TRANSACTIONS_BY_CATEGORY_ID_ORDER_UNTIL : Sql.SELECT_TRANSACTIONS_BY_CATEGORY_ID_UNTIL);
            return statement.all(categoryId, untilDate);
          } else {
            const statement = this.db.prepare(Sql.SELECT_TRANSACTIONS_BY_CATEGORY_ID_LIMIT_UNTIL);
            return statement.all(categoryId, untilDate, count);
          }
        } else {
          if (count === 0) {
            const statement = this.db.prepare(ordered ? Sql.SELECT_TRANSACTIONS_ORDER_UNTIL : Sql.SELECT_TRANSACTIONS_UNTIL);
            return statement.all(untilDate);
          } else {
            const statement = this.db.prepare(Sql.SELECT_TRANSACTIONS_LIMIT_UNTIL);
            return statement.all(untilDate, count);
          }
        }
      } else {
        if (typeof categoryId === 'number') {
          if (count === 0) {
            const statement = this.db.prepare(ordered ? Sql.SELECT_TRANSACTIONS_BY_CATEGORY_ID_ORDER : Sql.SELECT_TRANSACTIONS_BY_CATEGORY_ID);
            return statement.all(categoryId);
          } else {
            const statement = this.db.prepare(Sql.SELECT_TRANSACTIONS_BY_CATEGORY_ID_LIMIT);
            return statement.all(categoryId, count);
          }
        } else {
          if (count === 0) {
            const statement = this.db.prepare(ordered ? Sql.SELECT_TRANSACTIONS_ORDER : Sql.SELECT_TRANSACTIONS);
            return statement.all();
          } else {
            const statement = this.db.prepare(Sql.SELECT_TRANSACTIONS_LIMIT);
            return statement.all(count);
          }
        }
      }
    } catch (e) {
      this.logger.error(Msg.DB_SELECT_FAIL, `transactions (message: ${e.message})`);
    }
  }

  private getCategoryByName(name: string): number | undefined {
    try {
      const statement = this.db.prepare(Sql.SELECT_CATEGORY_BY_NAME);
      const result = statement.get(name);
      return result ? result.id : undefined;
    } catch {
      this.logger.error(Msg.DB_SELECT_FAIL, 'categories');
    }
  }

  public balance(splitPerCategory = false, categoryName?: string, untilDate?: string): Record<string, number> {
    if (!this.db) {
      this.logger.error(Msg.DB_NOT_CONNECTED);
    }
    const dbCategories = this.getCategoriesById();
    let categoryId: number | undefined = undefined;
    if (typeof categoryName === 'string') {
      categoryId = this.getCategoryByName(categoryName);
      if (typeof categoryId !== 'number') {
        this.logger.error(Msg.CATEGORY_NOT_FOUND, categoryName);
      }
    }
    const dbTransactions = this.getTransactions(0, categoryId, untilDate);
    const result: Record<string, number> = {};
    dbTransactions.reduce((acc, {category_id, amount}) => {
      const key = splitPerCategory ? dbCategories[category_id] : 'TOTAL';
      if (typeof result[key] !== 'number') {
        result[key] = 0;
      }
      result[key] = result[key] + amount;
      return acc;
    }, result);
    return result;
  }

  public transactions(count: number, categoryName?: string, untilDate?: string): Transaction[] {
    if (!this.db) {
      this.logger.error(Msg.DB_NOT_CONNECTED);
    }
    const dbCategories = this.getCategoriesById();
    let categoryId: number | undefined = undefined;
    if (typeof categoryName === 'string') {
      categoryId = this.getCategoryByName(categoryName);
      if (typeof categoryId !== 'number') {
        this.logger.error(Msg.CATEGORY_NOT_FOUND, categoryName);
      }
    }
    const dbTransactions = this.getTransactions(count, categoryId, untilDate, true);
    return dbTransactions.map<Transaction>(({date, category_id, amount}) => ({amount, category: dbCategories[category_id], date}));
  }
}
