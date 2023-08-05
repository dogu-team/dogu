import { Printable, stringify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { timestampLogger } from './logger.instance';

@Injectable()
export class DoguTimestampLogger implements Printable {
  private readonly timestampLogger = timestampLogger;

  error(message: unknown, details?: Record<string, unknown>): void {
    this.timestampLogger.error(stringify(message), details);
  }

  warn(message: unknown, details?: Record<string, unknown>): void {
    this.timestampLogger.warn(stringify(message), details);
  }

  info(message: unknown, details?: Record<string, unknown>): void {
    this.timestampLogger.info(stringify(message), details);
  }

  debug(message: unknown, details?: Record<string, unknown>): void {
    this.timestampLogger.debug(stringify(message), details);
  }

  verbose(message: unknown, details?: Record<string, unknown>): void {
    this.timestampLogger.verbose(stringify(message), details);
  }
}
