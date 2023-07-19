import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import { Circus } from '@jest/types';
import { isAxiosError } from 'axios';
import { TestEnvironment } from 'jest-environment-node';

import { createLogger } from './common.js';
import { DoguConfig, DoguConfigFactory } from './dogu-config.js';
import { DriverFactory } from './driver-factory.js';
import { RemoteDestReporter, RemoteDestReporterFactory } from './remote-dest-reporter.js';
import { RoutineDestReporter, RoutineDestReporterFactory } from './routine-dest-reporter.js';

export class DoguEnvironment extends TestEnvironment {
  private doguConfig: DoguConfig | null = null;
  private routineDestReporter: RoutineDestReporter | null = null;
  private driver: WebdriverIO.Browser | null = null;
  private remoteDestReporter: RemoteDestReporter | null = null;
  private logger = createLogger('DoguEnvironment');

  constructor(config: JestEnvironmentConfig, _context: EnvironmentContext) {
    super(config, _context);
  }

  override async setup(): Promise<void> {
    await super.setup();
    this.doguConfig = await new DoguConfigFactory().create();
    this.routineDestReporter = new RoutineDestReporterFactory(this.doguConfig).create();
    this.driver = await new DriverFactory().create(this.doguConfig);
    this.remoteDestReporter = new RemoteDestReporterFactory(this.doguConfig, this.driver).create();
  }

  override async teardown(): Promise<void> {
    this.remoteDestReporter = null;
    await this.driver?.deleteSession().catch((error) => {
      this.logger.error('deleteSession failed', error);
    });
    this.driver = null;
    this.routineDestReporter = null;
    this.doguConfig = null;
    await super.teardown();
  }

  async handleTestEvent(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): Promise<void> {
    await this.routineDestReporter?.handleTestEvent?.(event, state).catch((error) => {
      const parsedError = isAxiosError(error) ? error.toJSON() : error;
      this.logger.error('routineDestReporter.handleTestEvent failed', parsedError);
    });
    await this.remoteDestReporter?.handleTestEvent?.(event, state).catch((error) => {
      const parsedError = isAxiosError(error) ? error.toJSON() : error;
      this.logger.error('remoteDestReporter.handleTestEvent failed', parsedError);
    });
  }
}
