export type DbCategory = {
  id: number;
  name: string;
};

export type TransactionBase = {
  amount: number;
  date: string;
};

export type DbTransaction = TransactionBase & {
  id: number;
  category_id: number;
};

export type Transaction = TransactionBase & {
  category: string;
};

export type StrTransform = (param: string | number) => string;

export type CmdLineParserFn<T> = (value: string, previous: T) => T;

export type CmdLineArgument = {
  name: string;
  description: string;
  parser?: CmdLineParserFn<any>;
};

export type CmdLineOption = {
  name: string;
  description: string;
  parser?: CmdLineParserFn<any>;
  defaultValue?: string | boolean | string[] | number;
};

export type CmdLineOptionNames =
  | 'allCategories'
  | 'allRecords'
  | 'category'
  | 'count'
  | 'database'
  | 'since'
  | 'until';

export type CmdLineOptionsDict = {
  [K in CmdLineOptionNames]: CmdLineOption;
};
