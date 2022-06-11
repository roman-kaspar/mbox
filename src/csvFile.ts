import {parseFile} from '@fast-csv/parse';
import {access} from 'fs/promises';
import {constants} from 'fs';

import {Logger} from './logger';
import {Msg} from './messages';

export type CsvRecord = {
  amount: number;
  date: string;
  category: string;
};

export class CsvFile {
  private filename: string;
  private logger: Logger;

  constructor (filename: string, logger: Logger) {
    this.filename = filename;
    this.logger = logger;
  }

  public async parseFile(): Promise<CsvRecord[]> {
    try {
      await access(this.filename, constants.R_OK);
    } catch {
      this.logger.error(Msg.CSV_CANNOT_READ, this.filename);
    }
    const result: CsvRecord[] = [];
    let lineNumber = 1;
    return new Promise((resolve) => {
      parseFile(this.filename, {objectMode: true, headers: true})
        .on('error', (e) => {
          this.logger.error(e.message);
        })
        .on('data', (data) => {
          try {
            const csvRecord = this.parseRecord(data);
            result.push(csvRecord);
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

  private parseRecord(what: Record<string, string>): CsvRecord {
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
}
