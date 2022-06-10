import {Logger} from './logger';

export type ParserFunction = (value: string, previous: any) => any;

export type Argument = {
  name: string;
  description: string;
  parser?: ParserFunction;
};

export type Option = {
  name: string;
  description: string;
  parser?: ParserFunction;
  defaultValue?: string | boolean | string[] | number;
};

export abstract class Action {
  public readonly abstract name: string;
  public readonly abstract description: string;
  public readonly abstract arguments: Argument[];
  public readonly abstract options: Option[];
  public readonly abstract isDefault: boolean;
  public abstract do(...args: any[]): Promise<void>;

  protected readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }
}
