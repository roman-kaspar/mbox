import { Logger } from './logger';
import type { CmdLineArgument, CmdLineOption } from './types';

export abstract class Action {
  public readonly abstract name: string;
  public readonly abstract description: string;
  public readonly abstract arguments: CmdLineArgument[];
  public readonly abstract options: CmdLineOption[];
  public readonly abstract isDefault: boolean;
  public abstract do(...args: any[]): Promise<void>;

  protected readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }
}
