import printf from 'printf';
import {Logger} from './logger';
import {green, magenta, red, yellow} from './text';

const redError = red('error:');
const yellowWarning = yellow('warning:');
const greenInfo = green('info:');
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
