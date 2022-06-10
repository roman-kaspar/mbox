export const Sql: Record<string, string> = {
  CREATE_MIGRATIONS_TABLE: 'create table migrations (filename text);',
  SELECT_MIGRATIONS: 'select filename from migrations;',
  INSERT_MIGRATION: 'insert into migrations values (?);',
};
