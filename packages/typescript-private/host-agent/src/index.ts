import 'reflect-metadata';

import { ChildError } from '@dogu-private/dost-children';
import { Code } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { NestFactory } from '@nestjs/core';
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
  /**
   * @note load env lazy
   */
  logger.info('bootstrap', { DOGU_RUN_TYPE: env.DOGU_RUN_TYPE, cwd: process.cwd() });
  const winstonModuleLogger = WinstonModule.createLogger({
    instance: logger.winstonLogger(),
  });
  const app = await NestFactory.create(AppModule, {
    logger: winstonModuleLogger,
  });
  const messageMicroService = new MessageMicroService();
  app.connectMicroservice({
    strategy: messageMicroService,
    logger: winstonModuleLogger,
  });
  const messagePuller = app.get(MessagePuller);
  messagePuller.setMessageHandlers(messageMicroService.getHandlers() as MessageHandlers);
  await app.startAllMicroservices();
  try {
    await app.listen(env.DOGU_HOST_AGENT_PORT);
  } catch (error) {
    const casted = errorify(error);
    throw new ChildError(Code.CODE_HOST_AGENT_PORT_IN_USE, casted.message, undefined, { cause: casted });
  }
  logger.info(`ready - started server on ${env.DOGU_HOST_AGENT_PORT}`);
}
