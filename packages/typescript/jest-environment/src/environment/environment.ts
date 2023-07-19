import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import { Circus } from '@jest/types';
import { TestEnvironment } from 'jest-environment-node';
import 'reflect-metadata';

import { DoguConfig, DoguConfigFactory } from './config.js';
import { DriverFactory } from './driver.js';
import { StepReporter, StepReporterFactory } from './step-reporter.js';

export class DoguEnvironment extends TestEnvironment {
  private doguConfig: DoguConfig | null = null;
  private stepReporter: StepReporter | null = null;
  private driver: WebdriverIO.Browser | null = null;

  constructor(config: JestEnvironmentConfig, _context: EnvironmentContext) {
    super(config, _context);
  }

  override async setup(): Promise<void> {
    await super.setup();
    this.doguConfig = await new DoguConfigFactory().create();
    this.stepReporter = new StepReporterFactory(this.doguConfig).create();
    this.driver = await new DriverFactory().create(this.doguConfig);
  }

  override async teardown(): Promise<void> {
    await this.driver?.deleteSession();
    this.driver = null;
    this.stepReporter = null;
    this.doguConfig = null;
    await super.teardown();
  }

  async handleTestEvent(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): Promise<void> {
    await this.stepReporter?.handleTestEvent?.(event, state);
  }
}
