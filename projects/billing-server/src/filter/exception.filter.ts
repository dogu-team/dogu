import { SentryExceptionLimiter } from '@dogu-private/nestjs-common';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { logger } from '../module/logger/logger.instance';
import { isSentryEnabled } from '../sentry';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter<unknown> {
  private logger = logger;
  private sentryExceptionLimiter = new SentryExceptionLimiter(isSentryEnabled(), 0.1);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    this.sentryExceptionLimiter.sendException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { httpAdapter } = this.httpAdapterHost;

    const prefix = `[${request.method?.toUpperCase()}] ${request.url}\n`;
    this.logger.error(prefix, { exception });

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const httpMessage = exception instanceof HttpException ? exception.getResponse() : 'Internal Server Error';
    const responseBody = {
      statusCode: httpStatus,
      message: httpMessage,
    };
    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
