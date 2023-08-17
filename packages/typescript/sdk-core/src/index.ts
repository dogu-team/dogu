import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module.js';

export interface DoguSdkCoreOptions {
  /**
   * @default freePort
   */
  port?: number;
}

export class DoguSdkCore {
  private options: DoguSdkCoreOptions | null = null;
  private app: INestApplication | null = null;

  async open(options: DoguSdkCoreOptions) {
    console.log(process.argv);
    this.app = await NestFactory.create(AppModule);
    await this.app.listen(3000);
  }

  async close() {}
}
