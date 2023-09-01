import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import { Circus } from '@jest/types';
import { isAxiosError } from 'axios';
import { TestEnvironment } from 'jest-environment-node';
import _ from 'lodash';

import { createLogger } from './common.js';
import { DoguConfig, DoguConfigFactory } from './dogu-config.js';
import { DriverFactory } from './driver-factory.js';
import { RemoteDestReporter, RemoteDestReporterFactory } from './remote-dest-reporter.js';
import { RoutineDestReporter, RoutineDestReporterFactory } from './routine-dest-reporter.js';

const driver = 'driver';
const doguConfig = 'doguConfig';

declare global {
  /* @ts-ignore */
  const driver: Readonly<WebdriverIO.Browser>;

  /* @ts-ignore */
  const doguConfig: Readonly<DoguConfig>;
}

export class DoguEnvironment extends TestEnvironment {
  private logger = createLogger('DoguEnvironment');
  private doguConfig: DoguConfig | null = null;
  private routineDestReporter: RoutineDestReporter | null = null;
  private driver: WebdriverIO.Browser | null = null;
  private remoteDestReporter: RemoteDestReporter | null = null;
  private anyTestFailed = false;

  constructor(config: JestEnvironmentConfig, _context: EnvironmentContext) {
    super(config, _context);
  }

  override async setup(): Promise<void> {
    await super.setup();
    this.doguConfig = await new DoguConfigFactory().create();
    if (_.has(this.global, doguConfig)) {
      throw new Error('globalThis.doguConfig is already defined');
    }
    _.set(this.global, doguConfig, this.doguConfig);

    this.routineDestReporter = new RoutineDestReporterFactory(this.doguConfig).create();

    if (this.doguConfig.runsOn) {
      this.driver = await new DriverFactory().create(this.doguConfig);
      if (_.has(this.global, driver)) {
        throw new Error('globalThis.driver is already defined');
      }
      _.set(this.global, driver, this.driver);

      this.remoteDestReporter = new RemoteDestReporterFactory(this.doguConfig, this.driver).create();
    }
  }

  override async teardown(): Promise<void> {
    this.remoteDestReporter = null;

    if (_.has(this.global, driver)) {
      _.unset(this.global, driver);
    }
    await this.driver?.deleteSession().catch((error) => {
      this.logger.error('deleteSession failed', error);
    });
    this.driver = null;

    this.routineDestReporter = null;

    if (_.has(this.global, doguConfig)) {
      _.unset(this.global, doguConfig);
    }
    this.doguConfig = null;

    await super.teardown();
  }

  async handleTestEvent(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): Promise<void> {
    this.handleFailFast(event, state);

    await this.routineDestReporter?.handleTestEvent?.(event, state).catch((error) => {
      const parsedError = isAxiosError(error) ? error.toJSON() : error;
      this.logger.error('routineDestReporter.handleTestEvent failed', parsedError);
    });
    await this.remoteDestReporter?.handleTestEvent?.(event, state).catch((error) => {
      const parsedError = isAxiosError(error) ? error.toJSON() : error;
      this.logger.error('remoteDestReporter.handleTestEvent failed', parsedError);
    });
  }

  handleFailFast(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): void {
    if (!this.doguConfig) {
      throw new Error('Internal error. doguConfig is null');
    }

    const failFast = this.doguConfig.failFast;
    if (!failFast) {
      return;
    }

    if (!this.anyTestFailed) {
      if (event.name === 'hook_failure' || event.name === 'test_fn_failure') {
        this.anyTestFailed = true;
      }
    } else {
      if (event.name === 'test_start') {
        event.test.mode = 'skip';
      }
    }
  }
}
