import { Logger } from './logger.js';
import { Server } from './server/server.js';
import { loop } from './utils.js';

export class Runner {
  private readonly logger = Logger.create('Runner');

  async run(): Promise<void> {
    this.logger.info('run');
    const server = new Server();
    await server.start();
    for await (const _ of loop(1000)) {
      this.logger.info('loop');
    }
    await server.stop();
  }
}
