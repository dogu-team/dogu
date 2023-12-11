import { ArgumentsHost, Catch, HttpServer } from '@nestjs/common';

import { SentryExceptionLimiter } from '@dogu-private/nestjs-common';
import { BaseExceptionFilter } from '@nestjs/core';
import { env } from '../env';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private sentryExceptionLimiter = new SentryExceptionLimiter(env.DOGU_USE_SENTRY, 0.2);

  constructor(applicationRef?: HttpServer) {
    super(applicationRef);
  }

  override catch(exception: unknown, host: ArgumentsHost): void {
    this.sentryExceptionLimiter.sendException(exception);
    super.catch(exception, host);
  }
}
