import { createLogger } from './logger.js';
import { Preparer } from './preparer.js';
import { RemoteTestingProcessor } from './remote-testing-processor.js';

export class Runner {
  private readonly logger = createLogger('Runner');
  private readonly preparer = new Preparer();

  async run(): Promise<void> {
    this.logger.verbose('run');
    const prepareResult = await this.preparer.prepare();
    const { testingType } = prepareResult;
    switch (testingType) {
      case 'remote-testing':
        {
          const remoteTestingProcessor = new RemoteTestingProcessor();
          await remoteTestingProcessor.process();
        }
        break;
      default:
        throw new Error(`Unknown testing type: ${testingType}`);
    }
  }

  stop(): void {
    this.logger.verbose('stop');
  }
}
