export const Sql: Record<string, string> = {
  CREATE_MIGRATIONS_TABLE: 'create table migrations (filename text);',
  SELECT_MIGRATIONS: 'select filename from migrations;',
  INSERT_MIGRATION: 'insert into migrations (filename) values (?);',

  SELECT_CATEGORIES: 'select id, name from categories;',
  SELECT_CATEGORY_BY_NAME: 'select id, name from categories where (name = ?);',
  INSERT_CATEGORY: 'insert into categories (name) values (?) returning id;',

  SELECT_TRANSACTIONS: 'select id, category_id, amount, date from transactions;',
  SELECT_TRANSACTIONS_BY_CATEGORY_ID: 'select id, category_id, amount, date from transactions where (category_id = ?);',
  INSERT_TRANSACTION: 'insert into transactions (category_id, date, amount) values (?, ?, ?);',
};
