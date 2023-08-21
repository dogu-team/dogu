import { Logger } from './logger.js';
import { loop } from './utils.js';

export class Runner {
  private readonly logger = Logger.create('Runner');

  async run(): Promise<void> {
    this.logger.info('run');
    for await (const _ of loop(1000)) {
      this.logger.info('loop');
    }
  }
}
