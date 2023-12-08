import { handleLoggerCreateWithSentry } from '@dogu-private/nestjs-common';
import { Serial, SerialPrintable } from '@dogu-private/types';
import { FilledPrintable } from '@dogu-tech/common';
import { LoggerFactory } from '@dogu-tech/node';
import { env } from '../env';

export function createAndroidLogger(serial: Serial): SerialLogger {
  const logger = LoggerFactory.createLazy(`${serial}_android`, { withFileTransports: true });
  handleLoggerCreateWithSentry(env.DOGU_USE_SENTRY, logger);
  return new SerialLogger(serial, logger);
}

export function createGdcLogger(serial: Serial): SerialLogger {
  const logger = LoggerFactory.createLazy(`${serial}_gdc`, { withFileTransports: true });
  handleLoggerCreateWithSentry(env.DOGU_USE_SENTRY, logger);
  return new SerialLogger(serial, logger);
}

export function createAdbSerialLogger(serial: Serial): SerialLogger {
  const logger = LoggerFactory.createLazy(`${serial}_adb`, { withFileTransports: true });
  handleLoggerCreateWithSentry(env.DOGU_USE_SENTRY, logger);
  return new SerialLogger(serial, logger);
}

export function createIosLogger(serial: Serial): SerialLogger {
  const logger = LoggerFactory.createLazy(`${serial}_ios`, { withFileTransports: true });
  handleLoggerCreateWithSentry(env.DOGU_USE_SENTRY, logger);
  return new SerialLogger(serial, logger);
}

export class SerialLogger implements SerialPrintable {
  constructor(
    public readonly serial: Serial,
    readonly logger: FilledPrintable,
  ) {}

  error(message: unknown, details?: Record<string, unknown>): void {
    this.logger.error(message, details);
  }

  warn(message: unknown, details?: Record<string, unknown>): void {
    this.logger.warn(message, details);
  }

  info(message: unknown, details?: Record<string, unknown>): void {
    this.logger.info(message, details);
  }

  debug(message: unknown, details?: Record<string, unknown>): void {
    this.logger.debug(message, details);
  }

  verbose(message: unknown, details?: Record<string, unknown>): void {
    this.logger.verbose(message, details);
  }
}
