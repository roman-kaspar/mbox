export const Sql: Record<string, string> = {
  CREATE_MIGRATIONS_TABLE: 'create table migrations (filename text);',
  SELECT_MIGRATIONS: 'select filename from migrations;',
  INSERT_MIGRATION: 'insert into migrations (filename) values (?);',

  SELECT_CATEGORIES: 'select id, name from categories;',
  INSERT_CATEGORY: 'insert into categories (name) values (?) returning id;',

  INSERT_TRANSACTION: 'insert into transactions (category_id, date, amount) values (?, ?, ?);',
};
