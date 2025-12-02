import { Action } from '../action';
import { Options } from '../cmdLineOptions';
import { createNumberParser } from '../cmdLineParsers';
import { Db } from '../db';
import { cyan, formatBalance, formatTransactions } from '../text';

const DEFAULT_COUNT = 25;

export class ListAction extends Action {
  public readonly name = 'list';
  public readonly description = 'print transactions (all, or of provided category)';
  public readonly arguments = [];
  public readonly options = [
    Options.database,
    Options.category,
    {
      ...Options.count,
      defaultValue: DEFAULT_COUNT,
      parser: createNumberParser(DEFAULT_COUNT),
    },
    Options.allRecords,
  ];
  public readonly isDefault = false;

  public async do(options: Record<string, any>): Promise<void> {
    const { all, category, count, database: dbFilename } = options;
    const db = new Db(dbFilename, this.logger);
    await db.connect();
    const transactions = db.transactions(all ? 0 : count, category);
    this.logger.info(`

${cyan(`*** TRANSACTIONS ${typeof category === 'string' ? `(category = "${category}") `: ''}***`)}

${formatTransactions(transactions, typeof category === 'string')}
`);
  }
}
