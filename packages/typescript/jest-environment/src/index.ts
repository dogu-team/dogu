import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import { Circus } from '@jest/types';
import NodeEnvironment from 'jest-environment-node';
import 'reflect-metadata';

import { StepOptionsFactory } from './protocols';
import { StepReporter, StepReporterFactory } from './step-reporter';

class DoguEnvironment extends NodeEnvironment {
  private stepReporter: StepReporter | null = null;

  constructor(config: JestEnvironmentConfig, _context: EnvironmentContext) {
    super(config, _context);
  }

  override async setup(): Promise<void> {
    await super.setup();
    const stepOptions = new StepOptionsFactory().create();
    const stepReporter = new StepReporterFactory(stepOptions).create();
    this.stepReporter = stepReporter;
  }

  override async teardown(): Promise<void> {
    this.stepReporter = null;
    await super.teardown();
  }

  async handleTestEvent(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): Promise<void> {
    await this.stepReporter?.handleTestEvent?.(event, state);
  }
}

export default DoguEnvironment;
