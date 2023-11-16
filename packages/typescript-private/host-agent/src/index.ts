import 'reflect-metadata';

import { ChildError } from '@dogu-private/dost-children';
import { handleLoggerCreateWithSentry, initSentry, SentryAllExceptionsFilter } from '@dogu-private/nestjs-common';
import { Code } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as Sentry from '@sentry/node';
import express from 'express';
import http from 'http';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app/app.module';
import { env } from './env';
import { logger } from './logger/logger.instance';
import { MessageMicroService } from './message/message.microservice';
import { MessagePuller } from './message/message.puller';
import { MessageHandlers } from './types';
export { onErrorToExit } from './child-utils';
export { logger };

export async function bootstrap(): Promise<void> {
  logger.addFileTransports();
  initSentry(env.DOGU_USE_SENTRY, {
    dsn: 'https://6a59512ce56af70799829dc421598043@o4505097685565440.ingest.sentry.io/4506234385596416',
    integrations: [new Sentry.Integrations.Http({ tracing: true }), ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()],
    environment: env.DOGU_RUN_TYPE,
    maxBreadcrumbs: 10000,
  });
  handleLoggerCreateWithSentry(env.DOGU_USE_SENTRY, logger);
  /**
   * @note load env lazy
   */
  logger.info('bootstrap', { DOGU_RUN_TYPE: env.DOGU_RUN_TYPE, cwd: process.cwd() });
  const winstonModuleLogger = WinstonModule.createLogger({
    instance: logger.winstonLogger(),
  });
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: winstonModuleLogger,
  });
  const messageMicroService = new MessageMicroService();
  app.connectMicroservice({
    strategy: messageMicroService,
    logger: winstonModuleLogger,
  });
  app.useGlobalFilters(new SentryAllExceptionsFilter(env.DOGU_USE_SENTRY, app.getHttpAdapter()));

  const messagePuller = app.get(MessagePuller);

  messagePuller.setMessageHandlers(messageMicroService.getHandlers() as MessageHandlers);
  await app.startAllMicroservices();

  try {
    await app.init();
    const httpServer = http.createServer({ noDelay: true, keepAlive: true }, server);
    httpServer.headersTimeout = 5000;
    httpServer.timeout = 10000;
    httpServer.listen({
      port: env.DOGU_HOST_AGENT_PORT,
      backlog: 10,
    });
  } catch (error) {
    const casted = errorify(error);
    throw new ChildError(Code.CODE_HOST_AGENT_PORT_IN_USE, casted.message, undefined, { cause: casted });
  }
  logger.info(`ready - started server on ${env.DOGU_HOST_AGENT_PORT}`);
}
