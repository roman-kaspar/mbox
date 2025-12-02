import { writeToPath } from '@fast-csv/format';
import { parseFile } from '@fast-csv/parse';
import { access } from 'fs/promises';
import { constants } from 'fs';

import { Logger } from './logger';
import { Msg } from './messages';
import type { Transaction } from './types';

export class CsvFile {
  private filename: string;
  private logger: Logger;

  constructor (filename: string, logger: Logger) {
    this.filename = filename;
    this.logger = logger;
  }

  public async parseFile(): Promise<Transaction[]> {
    try {
      await access(this.filename, constants.R_OK);
    } catch {
      this.logger.error(Msg.CSV_CANNOT_READ, this.filename);
    }
    const result: Transaction[] = [];
    let lineNumber = 1;
    return new Promise((resolve) => {
      parseFile(this.filename, {objectMode: true, headers: true})
        .on('error', (e) => {
          this.logger.error(e.message);
        })
        .on('data', (data) => {
          try {
            const transaction = this.parseRecord(data);
            result.push(transaction);
            lineNumber += 1;
          } catch {
            this.logger.error(Msg.CSV_INVALID_RECORD, this.filename, lineNumber + 1);
          }
        })
        .on('end', () => {
          resolve(result);
        });
    });
  }

  private parseRecord(what: Record<string, string>): Transaction {
    ['Amount', 'Category', 'Date'].forEach((field) => {
      if (!(field in what)) {
        throw new Error('invalid CVS record');
      }
    });
    const amount: number = parseFloat(what.Amount);
    if (Number.isNaN(amount)) {
      throw new Error('invalid CVS record');
    }
    return {
      amount: Math.round(amount * 100),
      category: what.Category,
      date: what.Date,
    };
  }

  public async exportTransactions(transactions: Transaction[]): Promise<void> {
    try {
      await access(this.filename, constants.R_OK);
      this.logger.error(Msg.CSV_FILE_ALREADY_EXISTS, this.filename);
    } catch {
      // pass
    }
    const processed = transactions.map(({amount, category, date}) => ([date, category, `${(amount / 100.0).toFixed(2)}`]));
    return new Promise((resolve) => {
      writeToPath(this.filename, processed, {headers: ['Date', 'Category', 'Amount']})
        .on('error', (e) => {
          this.logger.error(e.message);
        })
        .on('finish', () => {
          this.logger.info(Msg.CSV_EXPORT_SUCCESS, processed.length, this.filename);
          resolve();
        });
    });
  }
}
