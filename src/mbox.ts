import {registerCommands} from './cmdLine';
import {ConsoleLogger} from './consoleLogger';
import {InitDbAction} from './initDbAction';
import {ImportAction} from './importAction';
import {BalanceAction} from './balanceAction';
import {ListAction} from './listAction';
import {ExportAction} from './exportAction';

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
