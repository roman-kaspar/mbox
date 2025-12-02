export const Sql: Record<string, string> = {
  CREATE_MIGRATIONS_TABLE: 'create table migrations (filename text);',
  SELECT_MIGRATIONS: 'select filename from migrations;',
  INSERT_MIGRATION: 'insert into migrations (filename) values (?);',

  SELECT_CATEGORIES: 'select id, name from categories;',
  SELECT_CATEGORY_BY_NAME: 'select id, name from categories where (name = ?);',
  INSERT_CATEGORY: 'insert into categories (name) values (?) returning id;',

  SELECT_TRANSACTIONS: 'select id, category_id, amount, date from transactions;',
  SELECT_TRANSACTIONS_ORDER: 'select id, category_id, amount, date from transactions order by date desc;',
  SELECT_TRANSACTIONS_LIMIT: 'select id, category_id, amount, date from transactions order by date desc limit ?;',
  SELECT_TRANSACTIONS_BY_CATEGORY_ID: 'select id, category_id, amount, date from transactions where (category_id = ?);',
  SELECT_TRANSACTIONS_BY_CATEGORY_ID_ORDER: 'select id, category_id, amount, date from transactions where (category_id = ?) order by date desc;',
  SELECT_TRANSACTIONS_BY_CATEGORY_ID_LIMIT: 'select id, category_id, amount, date from transactions where (category_id = ?) order by date desc limit ?;',
  SELECT_TRANSACTIONS_UNTIL: 'select id, category_id, amount, date from transactions where (date < ?);',
  SELECT_TRANSACTIONS_ORDER_UNTIL: 'select id, category_id, amount, date from transactions where (date < ?) order by date desc;',
  SELECT_TRANSACTIONS_LIMIT_UNTIL: 'select id, category_id, amount, date from transactions where (date < ?) order by date desc limit ?;',
  SELECT_TRANSACTIONS_BY_CATEGORY_ID_UNTIL: 'select id, category_id, amount, date from transactions where (category_id = ? and date < ?);',
  SELECT_TRANSACTIONS_BY_CATEGORY_ID_ORDER_UNTIL: 'select id, category_id, amount, date from transactions where (category_id = ? and date < ?) order by date desc;',
  SELECT_TRANSACTIONS_BY_CATEGORY_ID_LIMIT_UNTIL: 'select id, category_id, amount, date from transactions where (category_id = ? and date < ?) order by date desc limit ?;',
  INSERT_TRANSACTION: 'insert into transactions (category_id, date, amount) values (?, ?, ?);',
};
