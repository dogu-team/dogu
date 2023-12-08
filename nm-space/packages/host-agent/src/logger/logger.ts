import { Printable, stringify } from '@dogu-tech/common';
import { Injectable } from '@nestjs/common';
import { logger } from './logger.instance';

@Injectable()
export class DoguLogger implements Printable {
  private readonly logger = logger;

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
}
