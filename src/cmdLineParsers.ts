type ParserFn<T> = (value: string, previous: T) => T;

export function createNumberParser(defaultValue: number): ParserFn<number> {
  return function(value: string, previous: number): number {
    const num = parseInt(value, 10);
    return Number.isNaN(num) ? defaultValue : num;
  };
}
