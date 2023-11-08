import { FilledPrintable, LogLevel, LogLevelEnum, stringify, toISOStringWithTimezone } from '@dogu-tech/common';
import lodash from 'lodash';
import { Format, TransformableInfo } from 'logform';
import winston, { format, LoggerOptions, transports } from 'winston';
import 'winston-daily-rotate-file';
import Transport from 'winston-transport';
import { appIsPackaged, HostPaths } from '.';

const logLevels: Record<LogLevel, LogLevelEnum> = {
  error: LogLevelEnum.ERROR,
  warn: LogLevelEnum.WARN,
  info: LogLevelEnum.INFO,
  debug: LogLevelEnum.DEBUG,
  verbose: LogLevelEnum.VERBOSE,
};

function resolveLevel(level: string): string {
  if (level === 'log') {
    return 'info';
  }
  return level;
}

function resolveRest(rest: object): string {
  Reflect.ownKeys(rest).forEach((key) => {
    if (typeof key === 'symbol') {
      Reflect.deleteProperty(rest, key);
    }
  });
  return Object.keys(rest).length > 0 ? ` | ${stringify(rest)}` : '';
}

export class LogFormatFactory {
  static createBase(): Format {
    return format.combine(
      format.timestamp({
        format: () => toISOStringWithTimezone(new Date()),
      }),
      format.printf((info: TransformableInfo): string => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { category, timestamp, level, message, ...rest } = info;
        const levelResolved = resolveLevel(level);
        const restResolved = resolveRest(rest);
        return `[${stringify(category)}] ${stringify(timestamp)} | ${levelResolved} | ${stringify(message)}${stringify(restResolved)}`;
      }),
    );
  }
}

interface AdditionalTransportProperty {
  category: string;
}

class AdditionalTransportPropertyAccessor {
  isAdditionalTransportProperty(transport: Transport): transport is Transport & AdditionalTransportProperty {
    return Reflect.has(transport, 'category');
  }

  get(transport: Transport): string | null {
    if (this.isAdditionalTransportProperty(transport)) {
      return transport.category;
    }
    return null;
  }

  set(transport: Transport, category: string): void {
    Reflect.defineProperty(transport, 'category', {
      value: category,
      writable: false,
    });
  }
}

const additionalTransportPropertyAccessor = new AdditionalTransportPropertyAccessor();

export const maxLogPeriod = '3d';

export class LogTransportFactory {
  static createConsole(): Transport {
    const baseFormat = LogFormatFactory.createBase();
    const instance = new transports.Console({
      debugStdout: true,
      format: format.combine(format.colorize({ all: true }), baseFormat),
    });
    additionalTransportPropertyAccessor.set(instance, 'console');
    return instance;
  }

  static createFile(category: string, logsPath = '', level: string, extension = '.log'): Transport {
    if (category.length == 0 || category.includes('/')) {
      throw new Error(`Invalid category: ${category}`);
    }
    if (!logsPath) {
      if (process.env.DOGU_LOGS_PATH) {
        logsPath = process.env.DOGU_LOGS_PATH;
      } else {
        logsPath = HostPaths.logsPath(appIsPackaged() ? HostPaths.doguHomePath : HostPaths.workingGeneratedPath);
      }
    }
    const extensionResolved = extension.startsWith('.') ? extension : `.${extension}`;
    const instance = new winston.transports.DailyRotateFile({
      dirname: logsPath,
      filename: `${category}_%DATE%`,
      extension: extensionResolved,
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: maxLogPeriod,
      format: format.combine(LogFormatFactory.createBase(), format.uncolorize()),
      level: level,
    });
    additionalTransportPropertyAccessor.set(instance, category);
    return instance;
  }
}

export function addFileTransports(winstonLogger: winston.Logger, category: string, logsPath?: string): boolean {
  if (winstonLogger.transports.findIndex((transport) => additionalTransportPropertyAccessor.get(transport) === category) !== -1) {
    return false;
  }
  winstonLogger.add(LogTransportFactory.createFile(category, logsPath, winstonLogger.level));
  return true;
}

export interface LoggerFactoryOptions {
  /**
   * @default verbose
   */
  level?: LogLevel;

  /**
   * @default true
   */
  withConsoleTransport?: boolean;

  /**
   * @default false
   */
  withFileTransports?: boolean;

  /**
   * @default ''
   * @description used only when withFileTransports is true
   */
  logsPath?: string;
}

type FilledLoggerFactoryOptions = Required<LoggerFactoryOptions>;

function defaultLoggerFactoryOptions(): FilledLoggerFactoryOptions {
  return {
    level: 'verbose',
    withConsoleTransport: true,
    withFileTransports: false,
    logsPath: '',
  };
}

function fillLoggerFactoryOptions(options?: LoggerFactoryOptions): FilledLoggerFactoryOptions {
  return lodash.merge(defaultLoggerFactoryOptions(), options);
}

export class LoggerOptionsFactory {
  static create(category: string, options?: LoggerFactoryOptions): LoggerOptions {
    const { level, withConsoleTransport } = fillLoggerFactoryOptions(options);
    const transports = [];
    if (withConsoleTransport) {
      transports.push(LogTransportFactory.createConsole());
    }
    const levelArray = LogLevel as readonly string[];
    const levelResolved = process.env.DOGU_LOG_LEVEL && levelArray.includes(process.env.DOGU_LOG_LEVEL) ? process.env.DOGU_LOG_LEVEL : level;
    return {
      levels: logLevels,
      level: levelResolved,
      defaultMeta: { category },
      format: format.errors({ stack: true }),
      transports,
    };
  }
}

export class Logger implements FilledPrintable {
  constructor(
    private readonly logger: winston.Logger,
    readonly category: string,
  ) {}

  error(message: unknown, details?: Record<string, unknown>): void {
    this.logger.error(stringify(message), details);
  }

  warn(message: unknown, details?: Record<string, unknown>): void {
    this.logger.warn(stringify(message), details);
  }

  info(message: unknown, details?: Record<string, unknown>): void {
    this.logger.info(stringify(message), details);
  }

  debug(message: unknown, details?: Record<string, unknown>): void {
    this.logger.debug(stringify(message), details);
  }

  verbose(message: unknown, details?: Record<string, unknown>): void {
    this.logger.verbose(stringify(message), details);
  }

  winstonLogger(): winston.Logger {
    return this.logger;
  }

  addFileTransports(logsPath?: string): boolean {
    return addFileTransports(this.logger, this.category, logsPath);
  }

  setLogLevel(level: LogLevel): void {
    this.logger.level = level;
  }
}

function newLogMessage(category: string, level: string): string {
  return `

| Logger created category: ${category} | ${level} |

`;
}

export class LoggerFactory {
  static create(category: string, options?: LoggerFactoryOptions): Logger {
    const { withFileTransports, logsPath } = fillLoggerFactoryOptions(options);
    const winstonLogger = winston.createLogger(LoggerOptionsFactory.create(category, options));

    if (withFileTransports) {
      addFileTransports(winstonLogger, category, logsPath);
    }
    winstonLogger.info(newLogMessage(category, winstonLogger.level));
    return new Logger(winstonLogger, category);
  }

  static createLazy(category: string, options?: LoggerFactoryOptions): Logger {
    let instance: Logger | null = null;
    return new Proxy(
      {},
      {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        get(target, prop, receiver) {
          if (!instance) {
            instance = LoggerFactory.create(category, options);
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return Reflect.get(instance, prop, receiver);
        },
      },
    ) as Logger;
  }
}

export const logger = LoggerFactory.createLazy('default');
