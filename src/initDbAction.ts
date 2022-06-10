import {Action} from './action';
import {commonOptions} from './cmdLineCommonOptions';
import {Db} from './db';

export class InitDbAction extends Action {
  public readonly name = 'init_db';
  public readonly description = 'create new SQLite3 database';
  public readonly arguments = [];
  public readonly options = [...commonOptions];
  public readonly isDefault = false;

  public async do(options: Record<string, any>): Promise<void> {
    const {database: filename} = options;
    const db = new Db(filename, this.logger);
    await db.create();
    this.logger.finish();
  }
}
