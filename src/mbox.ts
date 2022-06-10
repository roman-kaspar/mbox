import {registerCommands} from './cmdLine';
import {ConsoleLogger} from './consoleLogger';
import {InitDbAction} from './initDbAction';

export async function main(): Promise<void> {
  const logger = new ConsoleLogger();
  await registerCommands([
    new InitDbAction(logger),
  ]);
}
