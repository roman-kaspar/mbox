export abstract class Logger {
  public abstract error(err: string, ...rest: any[]): void;
  public abstract warning(err: string, ...rest: any[]): void;
  public abstract info(err: string, ...rest: any[]): void;
  public abstract debug(err: string, ...rest: any[]): void;
  public abstract reset(): void;
  public abstract finish(): void;
}
