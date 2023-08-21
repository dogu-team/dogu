import { createLogger } from './logger.js';
import { loop } from './utils.js';

export class Runner {
  private readonly logger = createLogger('Runner');

  async run(): Promise<void> {
    this.logger.verbose('run');
    for await (const _ of loop(1000)) {
      this.logger.verbose('loop');
    }
  }

  stop(): void {
    this.logger.verbose('stop');
  }
}
