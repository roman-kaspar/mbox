import {Option} from './action';

export const commonOptions: Option[] = [
  {
    name: '-d, --database <filename>',
    description: 'location of the database file',
    defaultValue: './mbox.db',
  },
];
