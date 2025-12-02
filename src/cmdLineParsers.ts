import type { CmdLineParserFn } from './types';

export function createNumberParser(defaultValue: number): CmdLineParserFn<number> {
  return function(value: string, previous: number): number {
    const num = parseInt(value, 10);
    return Number.isNaN(num) ? defaultValue : num;
  };
}
