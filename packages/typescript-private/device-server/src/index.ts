import 'reflect-metadata';

import { ChildError } from '@dogu-private/dost-children';
import { Code, DOGU_PROTOCOL_VERSION } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { WinstonModule } from 'nest-winston';

import { AppModule } from './app/app.module';
import { env } from './env';
import { adbLogger, idcLogger, logger } from './logger/logger.instance';
import { openPathMap } from './path-map';
import { addProcessEventHandler } from './process-event';
export { BrowserInstaller } from './browser-installer';
export { onErrorToExit } from './child-utils';
export { logger };

export async function bootstrap(): Promise<void> {
  addProcessEventHandler();

  logger.addFileTransports();
  idcLogger.addFileTransports();
  adbLogger.addFileTransports();
  /**
   * @note load env lazy
   */
  logger.info('bootstrap', { DOGU_RUN_TYPE: env.DOGU_RUN_TYPE, cwd: process.cwd() });
  logger.info('dogu protocol version', { DOGU_PROTOCOL_VERSION });
  const pathMap = await openPathMap(env.ANDROID_HOME);
  logger.info('path map', { pathMap });

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: logger.winstonLogger(),
    }),
  });
  app
    .useWebSocketAdapter(new WsAdapter(app))
    .useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
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
