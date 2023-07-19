import { Circus } from '@jest/types';

import { createDestInfoRecursive, createLogger, createPaths, DestState, EventNode } from './common.js';
import { DoguConfig } from './dogu-config.js';
import { RoutineDestClient, RoutineDestData, RoutineDestOptions } from './routine-dest-client.js';

function findRoutineDestIdRecursive(routineDestDatas: RoutineDestData[], paths: string[]): number | null {
  if (paths.length === 0) {
    return null;
  }
  const routineDestData = routineDestDatas.find((routineDestData) => routineDestData.name === paths[0]);
  if (!routineDestData) {
    return null;
  }
  if (paths.length === 1) {
    return routineDestData.destId;
  }
  return findRoutineDestIdRecursive(routineDestData.children, paths.slice(1));
}

export interface RoutineDestReporter {
  handleTestEvent?(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): Promise<void>;
}

export class NullRoutineDestReporter implements RoutineDestReporter {}

export class RoutineDestReporterImpl implements RoutineDestReporter {
  private client: RoutineDestClient;
  private routineDestDatas: RoutineDestData[] = [];
  private readonly logger = createLogger('RoutineDestReporterImpl');

  constructor(readonly options: RoutineDestOptions) {
    this.client = new RoutineDestClient(options);
  }

  async handleTestEvent(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): Promise<void> {
    if (
      event.name === 'setup' ||
      event.name === 'teardown' ||
      event.name === 'add_hook' ||
      event.name === 'start_describe_definition' ||
      event.name === 'finish_describe_definition' ||
      event.name === 'add_test' ||
      event.name === 'run_finish' ||
      event.name === 'test_start' ||
      event.name === 'test_started' ||
      event.name === 'test_done' ||
      event.name === 'test_skip' ||
      event.name === 'test_todo' ||
      event.name === 'hook_start' ||
      event.name === 'hook_success' ||
      event.name === 'hook_failure'
    ) {
      // noop
    } else if (event.name === 'run_start') {
      await this.createRoutineDest(state.rootDescribeBlock);
    } else if (event.name === 'run_describe_start') {
      await this.updateRoutineDestState(event.describeBlock, DestState.RUNNING);
    } else if (event.name === 'run_describe_finish') {
      await this.updateRoutineDestState(event.describeBlock, DestState.PASSED);
    } else if (event.name === 'test_fn_start') {
      await this.updateRoutineDestState(event.test, DestState.RUNNING);
    } else if (event.name === 'test_fn_success') {
      await this.updateRoutineDestState(event.test, DestState.PASSED);
    } else if (event.name === 'test_fn_failure') {
      await this.updateRoutineDestState(event.test, DestState.FAILED);
    } else {
      this.logger.error(`unhandled event: ${event.name}`);
    }
  }

  private async createRoutineDest(eventNode: EventNode): Promise<void> {
    const routineDestInfo = createDestInfoRecursive(eventNode);
    this.routineDestDatas = await this.client.createRoutineDest([routineDestInfo]);
  }

  private async updateRoutineDestState(eventNode: EventNode, routineDestState: DestState): Promise<void> {
    const paths = createPaths(eventNode);
    const routineDestId = findRoutineDestIdRecursive(this.routineDestDatas, paths);
    if (!routineDestId) {
      return;
    }
    this.logger.info(`update routine dest state`, {
      paths,
      routineDestId,
      routineDestState,
    });
    return this.client.updateRoutineDestState(routineDestId, routineDestState, new Date().toISOString());
  }
}

export class RoutineDestReporterFactory {
  private readonly logger = createLogger('RoutineDestReporterFactory');

  constructor(private readonly doguConfig: DoguConfig) {}

  create(): RoutineDestReporter {
    if (!this.doguConfig.stepId) {
      this.logger.error('stepId is not set');
      return new NullRoutineDestReporter();
    }
    if (!this.doguConfig.deviceId) {
      this.logger.error('deviceId is not set');
      return new NullRoutineDestReporter();
    }
    if (!this.doguConfig.hostToken) {
      this.logger.error('hostToken is not set');
      return new NullRoutineDestReporter();
    }
    const options: RoutineDestOptions = {
      apiBaseUrl: this.doguConfig.apiBaseUrl,
      organizationId: this.doguConfig.organizationId,
      deviceId: this.doguConfig.deviceId,
      stepId: this.doguConfig.stepId,
      hostToken: this.doguConfig.hostToken,
    };
    return new RoutineDestReporterImpl(options);
  }
}
