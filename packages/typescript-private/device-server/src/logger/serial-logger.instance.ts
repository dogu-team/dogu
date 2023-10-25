import { Serial, SerialPrintable } from '@dogu-private/types';
import { FilledPrintable } from '@dogu-tech/common';
import { LoggerFactory } from '@dogu-tech/node';

export function createAndroidLogger(serial: Serial): SerialLogger {
  return new SerialLogger(serial, LoggerFactory.createLazy(`${serial}_android`, { withFileTransports: true }));
}

export function createIosLogger(serial: Serial): SerialLogger {
  return new SerialLogger(serial, LoggerFactory.createLazy(`${serial}_ios`, { withFileTransports: true }));
}

export class SerialLogger implements SerialPrintable {
  constructor(public readonly serial: Serial, readonly logger: FilledPrintable) {}

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
