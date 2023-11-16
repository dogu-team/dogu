import 'reflect-metadata';

import { ChildError, PlatformAbility } from '@dogu-private/dost-children';
import { handleLoggerCreateWithSentry, initSentry, SentryAllExceptionsFilter } from '@dogu-private/nestjs-common';
import { Code, DOGU_PROTOCOL_VERSION } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import * as Sentry from '@sentry/node';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app/app.module';
import { env } from './env';
import { adbLogger, deviceInfoLogger, logger, zombieLogger } from './logger/logger.instance';
import { openPathMap } from './path-map';
import { addProcessEventHandler } from './process-event';
export { onErrorToExit } from './child-utils';
export { logger };

export async function bootstrap(): Promise<void> {
  addProcessEventHandler();

  logger.addFileTransports();
  adbLogger.addFileTransports();
  initSentry(env.DOGU_USE_SENTRY, {
    dsn: 'https://93661171f4fb3283dffbfcb199a01c4b@o4505097685565440.ingest.sentry.io/4506234379304960',
    integrations: [new Sentry.Integrations.Http({ tracing: true }), ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()],
    environment: env.DOGU_RUN_TYPE,
    maxBreadcrumbs: 10000,
  });
  handleLoggerCreateWithSentry(env.DOGU_USE_SENTRY, logger);
  handleLoggerCreateWithSentry(env.DOGU_USE_SENTRY, zombieLogger);
  handleLoggerCreateWithSentry(env.DOGU_USE_SENTRY, adbLogger);
  handleLoggerCreateWithSentry(env.DOGU_USE_SENTRY, deviceInfoLogger);
  /**
   * @note load env lazy
   */
  logger.info('bootstrap', { DOGU_RUN_TYPE: env.DOGU_RUN_TYPE, cwd: process.cwd() });
  logger.info('dogu protocol version', { DOGU_PROTOCOL_VERSION });

  const platformAbility = new PlatformAbility(env.DOGU_DEVICE_PLATFORM_ENABLED);
  const pathMap = await openPathMap(env.ANDROID_HOME, platformAbility);
  logger.info('path map', { pathMap });

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: logger.winstonLogger(),
    }),
  });

  app
    .useWebSocketAdapter(new WsAdapter(app))
    .useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    .useGlobalFilters(new SentryAllExceptionsFilter(env.DOGU_USE_SENTRY, app.getHttpAdapter()))
    .enableCors({
      origin: true,
      preflightContinue: false,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 200,
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

  try {
    await app.listen(env.DOGU_DEVICE_SERVER_PORT);
  } catch (error) {
    const casted = errorify(error);
    throw new ChildError(Code.CODE_DEVICE_SERVER_PORT_IN_USE, casted.message, undefined, { cause: casted });
  }
  logger.info(`ready - started server on ${env.DOGU_DEVICE_SERVER_PORT}`);
}
