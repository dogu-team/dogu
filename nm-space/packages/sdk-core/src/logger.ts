import winston, { format } from 'winston';

export interface LoggerCreateOptions {
  label: string;
}

export type LoggerCreateArgs = string | Function | LoggerCreateOptions;

export type Logger = winston.Logger;

export const LogLevel = ['error', 'warn', 'info', 'verbose'] as const;
export type LogLevel = (typeof LogLevel)[number];

const logLevels: Record<string, number> = {
  error: 0,
  warn: 10,
  info: 20,
  verbose: 30,
};

export const instance = winston.createLogger({
  level: 'verbose',
  levels: logLevels,
  format: format.errors({ stack: true, cause: true }),
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.timestamp(), //
        format.prettyPrint({ colorize: true, depth: 8 }),
        format.colorize({ all: true }),
      ),
    }),
  ],
});

function getLabel(args: LoggerCreateArgs): string {
  switch (typeof args) {
    case 'string':
      return args;
    case 'function':
      return args.name;
    default:
      return args.label;
  }
}

export function createLogger(args: LoggerCreateArgs): Logger {
  const label = getLabel(args);
  return instance.child({ label });
}
