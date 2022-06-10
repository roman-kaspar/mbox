export const Msg: Record<string, string> = {
  DB_ALREADY_CONNECTED: 'database already connected',
  DB_iNOT_CONNECTED: 'database not connected',
  DB_ALREADY_EXISTS: 'database file "%s" already exists',
  DB_CANNOT_CREATE: 'cannot create DB "%s"',
  DB_CANNOT_CONNECT: 'cannot connect to DB "%s"',
  DB_MIGRATION_CREATE_FAIL: 'cannot create "migrations" table',
  DB_MIGRATION_CREATE_SUCCESS: 'created "migrations" table',
  DB_SELECT_FAIL: 'cannot select from table "%s"',

  MIGRATIONS_LENGTH: 'inconsistent migrations;\n+ on disk: [%s]\n+   in DB: [%s]',
  UNEXPECTED_MIGRATION: 'inconsistent migrations; expected (from DB) "%s", received (on disk) "%s"',
  MIGRATION_FILES_READ_FAIL: 'cannot read migration files in directory "%s"',
  MIGRATION_EXEC: 'executing migration "%s"',
  MIGRATION_FAIL: 'migration failed',
};