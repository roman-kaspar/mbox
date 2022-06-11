import {Action} from './action';
import {commonOptions} from './cmdLineCommonOptions';
import {CsvFile, CsvRecord} from './csvFile';
import {Db} from './db';

export class ImportAction extends Action {
  public readonly name = 'import';
  public readonly description = 'import transactions from CSV file';
  public readonly arguments = [{
    name: 'csv_filename',
    description: 'CSV filename with transactions to import',
  }];
  public readonly options = [...commonOptions];
  public readonly isDefault = false;

  public async do(csvFilename: string, options: Record<string, any>): Promise<void> {
    const {database: dbFilename} = options;
    const db = new Db(dbFilename, this.logger);
    await db.connect();
    const csvFile = new CsvFile(csvFilename, this.logger);
    const transactions: CsvRecord[] = await csvFile.parseFile();
    db.import(transactions);
  }

}
