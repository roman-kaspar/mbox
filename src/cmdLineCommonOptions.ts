import {CmdLineOption} from './types';

export const commonOptions: CmdLineOption[] = [
  {
    name: '-d, --database <filename>',
    description: 'location of the database file',
    defaultValue: './mbox.db',
  },
];
