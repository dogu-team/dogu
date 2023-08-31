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

export class ConsoleLogger implements FilledPrintable {
  error(message: unknown, details?: Record<string, unknown>): void {
    const messageString = stringify(message);
    details ? console.error(messageString, stringify(details)) : console.error(messageString);
    console.error(stringify(message), stringify(details));
  }

  warn(message: unknown, details?: Record<string, unknown>): void {
    const messageString = stringify(message);
    details ? console.warn(messageString, stringify(details)) : console.warn(messageString);
  }

  info(message: unknown, details?: Record<string, unknown>): void {
    const messageString = stringify(message);
    details ? console.info(messageString, stringify(details)) : console.info(messageString);
  }

  debug(message: unknown, details?: Record<string, unknown>): void {
    const messageString = stringify(message);
    details ? console.debug(messageString, stringify(details)) : console.debug(messageString);
  }

  verbose(message: unknown, details?: Record<string, unknown>): void {
    const messageString = stringify(message);
    details ? console.debug(messageString, stringify(details)) : console.debug(messageString);
  }

  static instance = new ConsoleLogger();
}

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
