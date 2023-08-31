import { stringify } from './functions.js';

export type LeveledLogMethod = (message: unknown, details?: Record<string, unknown>) => void;

export interface Printable {
  error: LeveledLogMethod;
  warn?: LeveledLogMethod;
  info: LeveledLogMethod;
  debug?: LeveledLogMethod;
  verbose?: LeveledLogMethod;
}

export type FilledPrintable = Required<Printable>;

export class PrefixLogger implements FilledPrintable {
  constructor(private readonly printable: Printable, private readonly prefix: string) {}

  error(message: unknown, details?: Record<string, unknown>): void {
    this.log(this.printable.error.bind(this.printable), message, details);
  }

  warn(message: unknown, details?: Record<string, unknown>): void {
    this.log(this.printable.warn?.bind(this.printable), message, details);
  }

  info(message: unknown, details?: Record<string, unknown>): void {
    this.log(this.printable.info.bind(this.printable), message, details);
  }

  debug(message: unknown, details?: Record<string, unknown>): void {
    this.log(this.printable.debug?.bind(this.printable), message, details);
  }

  verbose(message: unknown, details?: Record<string, unknown>): void {
    this.log(this.printable.verbose?.bind(this.printable), message, details);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private log(method: Function | undefined = undefined, message: unknown, details?: Record<string, unknown>): void {
    if (!method) {
      return;
    }
    const prefixed = `${this.prefix} ${stringify(message)}`;
    details ? method(prefixed, details) : method(prefixed);
  }
}
