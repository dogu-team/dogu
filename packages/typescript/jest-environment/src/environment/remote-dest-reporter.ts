import { Circus } from '@jest/types';
import _ from 'lodash';

import { createDestInfoRecursive, createLogger, createPaths, DestState, EventNode } from './common.js';
import { DoguConfig } from './dogu-config.js';
import { RemoteDestClient, RemoteDestData, RemoteDestOptions } from './remote-dest-client.js';

function findRemoteDestIdRecursive(remoteDestDatas: RemoteDestData[], paths: string[]): string | null {
  if (paths.length === 0) {
    return null;
  }
  const remoteDestData = remoteDestDatas.find((remoteDestDatas) => remoteDestDatas.name === paths[0]);
  if (!remoteDestData) {
    return null;
  }
  if (paths.length === 1) {
    return remoteDestData.remoteDestId;
  }
  return findRemoteDestIdRecursive(remoteDestData.children, paths.slice(1));
}

export interface RemoteDestReporter {
  handleTestEvent?(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): Promise<void>;
}

export class NullRemoteDestReporter implements RemoteDestReporter {}

export class RemoteDestReporterImpl implements RemoteDestReporter {
  private client: RemoteDestClient;
  private remoteDestDatas: RemoteDestData[] = [];
  private readonly logger = createLogger('RemoteDestReporterImpl');

  constructor(readonly options: RemoteDestOptions) {
    this.client = new RemoteDestClient(options);
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
      await this.createRemoteDest(state.rootDescribeBlock);
    } else if (event.name === 'run_describe_start') {
      await this.updateRemoteDestState(event.describeBlock, DestState.RUNNING);
    } else if (event.name === 'run_describe_finish') {
      await this.updateRemoteDestState(event.describeBlock, DestState.PASSED);
    } else if (event.name === 'test_fn_start') {
      await this.updateRemoteDestState(event.test, DestState.RUNNING);
    } else if (event.name === 'test_fn_success') {
      await this.updateRemoteDestState(event.test, DestState.PASSED);
    } else if (event.name === 'test_fn_failure') {
      await this.updateRemoteDestState(event.test, DestState.FAILED);
    } else {
      this.logger.error(`unhandled event: ${event.name}`);
    }
  }

  private async createRemoteDest(eventNode: EventNode): Promise<void> {
    const remoteDestInfo = createDestInfoRecursive(eventNode);
    this.remoteDestDatas = await this.client.createRemoteDest([remoteDestInfo]);
  }

  private async updateRemoteDestState(eventNode: EventNode, remoteDestState: DestState): Promise<void> {
    const paths = createPaths(eventNode);
    const remoteDestId = findRemoteDestIdRecursive(this.remoteDestDatas, paths);
    if (!remoteDestId) {
      return;
    }
    this.logger.info(`update remote dest state`, {
      paths,
      remoteDestId,
      remoteDestState,
    });
    return this.client.updateRemoteDestState(remoteDestId, remoteDestState, new Date().toISOString());
  }
}

export class RemoteDestReporterFactory {
  private readonly logger = createLogger('RemoteDestReporterFactory');

  constructor(private readonly doguConfig: DoguConfig, private readonly driver: WebdriverIO.Browser) {}

  create(): RemoteDestReporter {
    const remoteDeviceJobId = _.get(this.driver.capabilities, 'dogu:results.remoteDeviceJobId') as string | undefined;
    if (!remoteDeviceJobId) {
      this.logger.info('remoteDeviceJobId is not found');
      return new NullRemoteDestReporter();
    }
    const options: RemoteDestOptions = {
      apiBaseUrl: this.doguConfig.apiBaseUrl,
      projectId: this.doguConfig.projectId,
      token: this.doguConfig.token,
      remoteDeviceJobId,
    };
    return new RemoteDestReporterImpl(options);
  }
}
