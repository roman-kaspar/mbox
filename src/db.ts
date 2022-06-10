import Database from 'better-sqlite3';
import {access, readdir, readFile} from 'fs/promises';
import {constants} from 'fs';
import {resolve} from 'path';

import {Logger} from './logger';
import {Msg} from './messages';
import {Sql} from './sql';

const registerExitHandlers = (db: Database) => {
  process.on('exit', () => db.close());
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
      this.db = new Database(this.filename);
      this.db.pragma('foreign_keys = ON');
      registerExitHandlers(this.db);
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
    if (!this.db) {
      this.logger.error(Msg.DB_NOT_CONNECTED);
    }
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
};
