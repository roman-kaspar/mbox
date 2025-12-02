import { registerCommands } from './cmdLine';
import { ConsoleLogger } from './consoleLogger';
import { InitDbAction } from './actions/initDbAction';
import { ImportAction } from './actions/importAction';
import { BalanceAction } from './actions/balanceAction';
import { ListAction } from './actions/listAction';
import { ExportAction } from './actions/exportAction';

export async function main(): Promise<void> {
  const logger = new ConsoleLogger();
  await registerCommands([
    new InitDbAction(logger),
    new ImportAction(logger),
    new BalanceAction(logger),
    new ListAction(logger),
    new ExportAction(logger),
  ]);
}
