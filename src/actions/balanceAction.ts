import { Action } from '../action';
import { Options } from '../cmdLineOptions';
import { Db } from '../db';
import { cyan, formatBalance } from '../text';

export class BalanceAction extends Action {
  public readonly name = 'balance';
  public readonly description = 'print balance of the account (overall, or per category)';
  public readonly arguments = [];
  public readonly options = [
    Options.database,
    Options.category,
    Options.allCategories,
  ];
  public readonly isDefault = false;

  public async do(options: Record<string, any>): Promise<void> {
    const { allCategories, category, database: dbFilename } = options;
    const db = new Db(dbFilename, this.logger);
    await db.connect();
    let balanceInfo: Record<string, number>;
    if (allCategories) {
      balanceInfo = db.balance(true);
    } else if (category) {
      balanceInfo = db.balance(true, category);
    } else {
      balanceInfo = db.balance();
    }
    this.logger.info(`\n\n${cyan('*** BALANCE ***')}\n\n${formatBalance(balanceInfo)}\n`);
  }
}
