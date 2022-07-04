import {StrTransform, Transaction} from './types';

export const cyan: StrTransform = (text) => `\x1b[36m${text}\x1b[0m`;
export const green: StrTransform = (text) => `\x1b[32m${text}\x1b[0m`;
export const magenta: StrTransform = (text) => `\x1b[35m${text}\x1b[0m`;
export const red: StrTransform = (text) => `\x1b[31m${text}\x1b[0m`;
export const yellow: StrTransform = (text) => `\x1b[33m${text}\x1b[0m`;
export const gray: StrTransform = (text) => `\x1b[90m${text}\x1b[0m`;

function centsToStr(cents: number): string {
  const digits = Math.abs(cents).toString().split('');
  while (digits.length < 3) {
    digits.unshift('0');
  }
  const result: string[] = [];
  // fraction: 2 digits
  result.unshift(digits.pop());
  result.unshift(digits.pop());
  // decimal point
  result.unshift(',');
  // integral digits
  let pow = 0;
  while (digits.length) {
    result.unshift(digits.pop());
    pow += 1;
    if ((pow % 3 === 0) && (digits.length)) {
      result.unshift(' ');
    }
  }
  // sign
  if (cents < 0) {
    result.unshift('-');
  }
  const str = result.join('');
  return (cents < 0) ? red(str) : (cents > 0) ? green(str) : gray(str);
}

export function formatBalance(info: Record<string, number>): string {
  let cLength = 0;
  let aLength = 0;
  const processed = Object.entries(info).map(([category, amount]) => {
    cLength = Math.max(cLength, category.length);
    const amountStr = centsToStr(amount);
    aLength = Math.max(aLength, amountStr.length);
    return {category, amountStr};
  });
  return processed
    .map(({category, amountStr}) => `* ${category.padStart(cLength, ' ')}: ${amountStr.padStart(aLength, ' ')}`)
    .join('\n');
}

type ProcessedTransaction = Omit<Transaction, 'amount'> & {
  amountStr: string;
};

export function formatTransactions(transactions: Transaction[], isOneCategory: boolean): string {
  let aLength = 0;
  const processed: ProcessedTransaction[] = [];
  while (transactions.length) {
    const {amount, category, date} = transactions.pop();
    const amountStr = centsToStr(amount);
    aLength = Math.max(aLength, amountStr.length);
    processed.push({amountStr, category, date});
  }
  return processed
    .map(({date, category, amountStr}) => `* ${date}: ${amountStr.padStart(aLength, ' ')}${isOneCategory ? '': ` (${category})`}`)
    .join('\n');
}
