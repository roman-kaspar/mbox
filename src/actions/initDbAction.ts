import { Action } from '../action';
import { Options } from '../cmdLineOptions';
import { Db } from '../db';

export class InitDbAction extends Action {
  public readonly name = 'init_db';
  public readonly description = 'create new SQLite3 database';
  public readonly arguments = [];
  public readonly options = [ Options.database ];
  public readonly isDefault = false;

  public async do(options: Record<string, any>): Promise<void> {
    const { database: filename } = options;
    const db = new Db(filename, this.logger);
    await db.create();
  }
}
