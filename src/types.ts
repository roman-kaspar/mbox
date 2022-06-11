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
