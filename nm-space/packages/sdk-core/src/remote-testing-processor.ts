import { createLogger } from './logger.js';
import { Processor } from './processor.js';

export class RemoteTestingProcessor extends Processor {
  private readonly logger = createLogger(RemoteTestingProcessor);

  async process() {
    this.logger.verbose('process');
  }
}
