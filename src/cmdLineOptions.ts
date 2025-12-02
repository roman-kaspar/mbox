import type { CmdLineOptionsDict } from './types';

export const Options: CmdLineOptionsDict = {
  allCategories: {
    name: '-a, --all-categories',
    description: 'print all per-category balances',
  },
  allRecords: {
    name: '-a, --all',
    description: 'alias for "-n 0", i.e. print all transactions',
  },
  category: {
    name: '-c, --category <name>',
    description: 'category filter',
  },
  count: {
    name: '-n, --count <N>',
    description: 'print only last N transactions, N=0 for all transactions',
  },
  database: {
    name: '-d, --database <filename>',
    description: 'location of the database file',
    defaultValue: './mbox.db',
  },
  until: {
    name: '-u, --until <date>',
    description: 'apply only for transactions until provided date <yyyy-mm-dd>',
  },
};
