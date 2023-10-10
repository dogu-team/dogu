import { IsDateString, IsIn, IsString } from 'class-validator';
import { stringify } from './strings/functions';
import { IsOptionalObject } from './validations/decorators';

export enum LogLevelEnum {
  ERROR = 0,
  WARN = 10,
  INFO = 20,
  DEBUG = 30,
  VERBOSE = 40,
}

export const LogLevel = ['error', 'warn', 'info', 'debug', 'verbose'] as const;
export type LogLevel = (typeof LogLevel)[number];

export function logLevelEnumToType(level: LogLevelEnum): LogLevel {
  function assertUnreachable(value: never): void {
    // noop
  }

  switch (level) {
    case LogLevelEnum.ERROR:
      return 'error';
    case LogLevelEnum.WARN:
      return 'warn';
    case LogLevelEnum.INFO:
      return 'info';
    case LogLevelEnum.DEBUG:
      return 'debug';
    case LogLevelEnum.VERBOSE:
      return 'verbose';
  }

  assertUnreachable(level);
}

export function logLevelTypeToEnum(level: LogLevel): LogLevelEnum {
  switch (level) {
    case 'error':
      return LogLevelEnum.ERROR;
    case 'warn':
      return LogLevelEnum.WARN;
    case 'info':
      return LogLevelEnum.INFO;
    case 'debug':
      return LogLevelEnum.DEBUG;
    case 'verbose':
      return LogLevelEnum.VERBOSE;
  }
}

export interface LogInfo {
  message: unknown;
  time: number;
  details?: Record<string, unknown>;
}

export interface LevelLogInfo extends LogInfo {
  level: LogLevel;
}

export type LeveledLogMethod = (message: unknown, details?: Record<string, unknown>) => void;

export interface Printable {
  error: LeveledLogMethod;
  warn?: LeveledLogMethod;
  info: LeveledLogMethod;
  debug?: LeveledLogMethod;
  verbose?: LeveledLogMethod;
}

export type FilledPrintable = Required<Printable>;

export class Log {
  @IsIn(LogLevel)
  level!: LogLevel;

  @IsString()
  message!: string;

  @IsOptionalObject()
  details?: Record<string, unknown>;

  @IsDateString()
  localTimeStampNano!: string;
}

export class NullLogger implements FilledPrintable {
  error(): void {
    // noop
  }

  warn(): void {
    // noop
  }

  info(): void {
    // noop
  }

  debug(): void {
    // noop
  }

  verbose(): void {
    // noop
  }

  static instance = new NullLogger();
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

export class BufferLogger implements FilledPrintable {
  readonly buffers = new Map<LogLevel, LogInfo[]>();

  constructor(private readonly options: { limit: number } = { limit: 0 }) {
    LogLevel.forEach((level) => this.buffers.set(level, []));
  }

  error(message: unknown, details?: Record<string, unknown>): void {
    this.pushToBuffer('error', message, details);
  }

  warn(message: unknown, details?: Record<string, unknown>): void {
    this.pushToBuffer('warn', message, details);
  }

  info(message: unknown, details?: Record<string, unknown>): void {
    this.pushToBuffer('info', message, details);
  }

  debug(message: unknown, details?: Record<string, unknown>): void {
    this.pushToBuffer('debug', message, details);
  }

  verbose(message: unknown, details?: Record<string, unknown>): void {
    this.pushToBuffer('verbose', message, details);
  }

  sortedLogInfos(): LevelLogInfo[] {
    const logInfos = Array.from(this.buffers).flatMap((buffer) =>
      buffer[1].flatMap((log) => {
        return {
          level: buffer[0],
          time: log.time,
          message: log.message,
          details: log.details,
        };
      }),
    );
    logInfos.sort((a, b) => a.time - b.time);
    return logInfos;
  }

  private pushToBuffer(level: LogLevel, message: unknown, details?: Record<string, unknown>): void {
    const buffer = this.buffers.get(level);
    if (!buffer) {
      return;
    }
    buffer.push({ message, time: Date.now(), details });
    if (this.options.limit > 0 && buffer.length > this.options.limit) {
      buffer.shift();
    }
  }
}

export interface LevelHavable {
  level: LogLevel;
}

export type LevelLoggable = FilledPrintable & LevelHavable;

export class LevelLogger implements LevelLoggable {
  constructor(private readonly printable: Printable, public level: LogLevel) {}

  error(message: unknown, details?: Record<string, unknown>): void {
    this.log(this.printable.error.bind(this.printable), 'error', message, details);
  }

  warn(message: unknown, details?: Record<string, unknown>): void {
    this.log(this.printable.warn?.bind(this.printable), 'warn', message, details);
  }

  info(message: unknown, details?: Record<string, unknown>): void {
    this.log(this.printable.info.bind(this.printable), 'info', message, details);
  }

  debug(message: unknown, details?: Record<string, unknown>): void {
    this.log(this.printable.debug?.bind(this.printable), 'debug', message, details);
  }

  verbose(message: unknown, details?: Record<string, unknown>): void {
    this.log(this.printable.verbose?.bind(this.printable), 'verbose', message, details);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private log(method: Function | undefined = undefined, level: LogLevel, message: unknown, details?: Record<string, unknown>): void {
    if (!method) {
      return;
    }
    const logLevel = logLevelTypeToEnum(this.level);
    const messageLevel = logLevelTypeToEnum(level);
    if (messageLevel <= logLevel) {
      details ? method(message, details) : method(message);
    }
  }
}

export class LevelConsoleLogger extends LevelLogger {
  constructor(level: LogLevel) {
    super(ConsoleLogger.instance, level);
  }
}

export class PrefixLevelConsoleLogger extends PrefixLogger implements LevelLoggable {
  private readonly levelLoggable: LevelLoggable;

  constructor(prefix: string, level: LogLevel) {
    const levelLoggable = new LevelConsoleLogger(level);
    super(levelLoggable, prefix);
    this.levelLoggable = levelLoggable;
  }

  set level(value: LogLevel) {
    this.levelLoggable.level = value;
  }

  get level(): LogLevel {
    return this.levelLoggable.level;
  }
}

export class LoggerHolder implements FilledPrintable {
  private printable: Printable | null = null;

  error(message: unknown, details?: Record<string, unknown>): void {
    this.printable?.error(message, details);
  }

  warn(message: unknown, details?: Record<string, unknown>): void {
    this.printable?.warn?.(message, details);
  }

  info(message: unknown, details?: Record<string, unknown>): void {
    this.printable?.info(message, details);
  }

  debug(message: unknown, details?: Record<string, unknown>): void {
    this.printable?.debug?.(message, details);
  }

  verbose(message: unknown, details?: Record<string, unknown>): void {
    this.printable?.verbose?.(message, details);
  }

  setLogger(printable: Printable): void {
    this.printable = printable;
  }
}

export class IdleCheckLogger implements FilledPrintable {
  constructor(private _lastLogTime: number = Date.now()) {}

  isBefore(deltaTimeMillis: number): boolean {
    return Date.now() - this._lastLogTime > deltaTimeMillis;
  }

  error(message: unknown, details?: Record<string, unknown>): void {
    this._lastLogTime = Date.now();
  }

  warn(message: unknown, details?: Record<string, unknown>): void {
    this._lastLogTime = Date.now();
  }

  info(message: unknown, details?: Record<string, unknown>): void {
    this._lastLogTime = Date.now();
  }

  debug(message: unknown, details?: Record<string, unknown>): void {
    this._lastLogTime = Date.now();
  }

  verbose(message: unknown, details?: Record<string, unknown>): void {
    this._lastLogTime = Date.now();
  }
}

export class MixedLogger implements FilledPrintable {
  constructor(readonly loggers: Printable[]) {}

  error(message: unknown, details?: Record<string, unknown>): void {
    for (const logger of this.loggers) {
      logger.error(message, details);
    }
  }

  warn(message: unknown, details?: Record<string, unknown>): void {
    for (const logger of this.loggers) {
      logger.warn?.(message, details);
    }
  }

  info(message: unknown, details?: Record<string, unknown>): void {
    for (const logger of this.loggers) {
      logger.info(message, details);
    }
  }

  debug(message: unknown, details?: Record<string, unknown>): void {
    for (const logger of this.loggers) {
      logger.debug?.(message, details);
    }
  }

  verbose(message: unknown, details?: Record<string, unknown>): void {
    for (const logger of this.loggers) {
      logger.verbose?.(message, details);
    }
  }
}
