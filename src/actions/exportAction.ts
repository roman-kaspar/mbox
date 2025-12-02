import { Action } from '../action';
import { Options } from '../cmdLineOptions';
import { CsvFile } from '../csvFile';
import { Db } from '../db';


export class ExportAction extends Action {
  public readonly name = 'export';
  public readonly description = 'export transactions to CSV file';
  public readonly arguments = [{
    name: 'csv_filename',
    description: 'CSV filename to export the transactions to',
  }];
  public readonly options = [ Options.database ];
  public readonly isDefault = false;

  public async do(csvFilename: string, options: Record<string, any>): Promise<void> {
    const {database: dbFilename} = options;
    const db = new Db(dbFilename, this.logger);
    await db.connect();
    const transactions = await db.transactions(0); // all
    const csvFile = new CsvFile(csvFilename, this.logger);
    await csvFile.exportTransactions(transactions);
  }
}
