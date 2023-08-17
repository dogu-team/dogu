import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { WinstonModule } from 'nest-winston';
import { Logger } from '../logger.js';
import { getFreePort } from '../utils.js';
import { AppModule } from './app/app.module.js';

export class Server {
  private readonly logger = Logger.create('Server');
  private app: INestApplication | null = null;

  async start(): Promise<void> {
    if (this.app) {
      this.logger.warn('Server already started');
      return;
    }

    const app = await NestFactory.create(AppModule, {
      logger: WinstonModule.createLogger({
        instance: Logger.create('Nest'),
      }),
    });
    app.useWebSocketAdapter(new WsAdapter(app));

    const port = await getFreePort();
    await app.listen(port, '127.0.0.1');
    this.app = app;
    this.logger.info(`Server started on url: ${await app.getUrl()}`);
  }

  async stop(): Promise<void> {
    if (!this.app) {
      this.logger.warn('Server not started');
      return;
    }

    await this.app.close();
    this.app = null;
    this.logger.info('Server stopped');
  }
}
