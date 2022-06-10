import printf from 'printf';
import {Logger} from './logger';

type StrTransform = (string) => string;

export const red: StrTransform = (text) => `\x1b[31m${text}\x1b[0m`;
const redError = red('error:');

export const yellow: StrTransform = (text) => `\x1b[33m${text}\x1b[0m`;
const yellowWarning = yellow('warning:');

export const green: StrTransform = (text) => `\x1b[32m${text}\x1b[0m`;
const greenInfo = green('info:');

export const magenta: StrTransform = (text) => `\x1b[35m${text}\x1b[0m`;
const magentaDebug = magenta('debug:');

export class ConsoleLogger extends Logger {
  private firstOutput = true;

  private message(fatal: boolean, prefix: string, err: string, ...rest: any[]): void {
    if (this.firstOutput) {
      console.log('');
    }
    this.firstOutput = false;
    if (rest.length) {
      console.log(`${prefix} ${printf(err, ...rest)}`);
    } else {
      console.log(`${prefix} ${err}`);
    }
    if (fatal) {
      console.log('');
      process.exit(1);
    }
  }

  public error(err: string, ...rest: any[]): void {
    this.message(true, redError, err, ...rest);
  }

  public warning(err: string, ...rest: any[]): void {
    this.message(false, yellowWarning, err, ...rest);
  }

  public info(err: string, ...rest: any[]): void {
    this.message(false, greenInfo, err, ...rest);
  }

  public debug(err: string, ...rest: any[]): void {
    this.message(false, magentaDebug, err, ...rest);
  }

  public reset(): void {
    this.firstOutput = true;
  }

  public finish(): void {
    console.log('');
  }
}
