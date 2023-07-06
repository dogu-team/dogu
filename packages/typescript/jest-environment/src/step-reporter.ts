import { Circus } from '@jest/types';

import { DestData, DestInfo, DestState, DestType, StepOptions, StepReportClient } from './protocols';
import { logger } from './utils';

type TestNode = Pick<Circus.TestEntry, 'name' | 'type' | 'parent'>;
type DescribeNode = Pick<Circus.DescribeBlock, 'name' | 'type' | 'parent' | 'children'>;
type Node = DescribeNode | TestNode;

function createDestInfoRecursive(node: Node): DestInfo {
  const { name, type } = node;
  return {
    name,
    type: type === 'test' ? DestType.UNIT : DestType.JOB,
    children: type === 'test' ? [] : node.children.map((child) => createDestInfoRecursive(child)),
  };
}

function createPaths(node: Node): string[] {
  let paths: string[] = [];
  let current: Node | undefined = node;
  while (current) {
    const { name } = current;
    paths = [name, ...paths];
    current = current.parent;
  }
  return paths;
}

function findDestIdRecursive(destDatas: DestData[], paths: string[]): number | null {
  if (paths.length === 0) {
    return null;
  }
  const destData = destDatas.find((destData) => destData.name === paths[0]);
  if (!destData) {
    return null;
  }
  if (paths.length === 1) {
    return destData.destId;
  }
  return findDestIdRecursive(destData.children, paths.slice(1));
}

export interface StepReporter {
  handleTestEvent?(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): Promise<void>;
}

export class NullStepReporter implements StepReporter {}

export class StepReporterImpl implements StepReporter {
  private client: StepReportClient;
  private destDatas: DestData[] = [];

  constructor(readonly options: StepOptions) {
    this.client = new StepReportClient(options);
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
      await this.createDest(state.rootDescribeBlock);
    } else if (event.name === 'run_describe_start') {
      await this.updateDestStatus(event.describeBlock, DestState.RUNNING);
    } else if (event.name === 'run_describe_finish') {
      await this.updateDestStatus(event.describeBlock, DestState.PASSED);
    } else if (event.name === 'test_fn_start') {
      await this.updateDestStatus(event.test, DestState.RUNNING);
    } else if (event.name === 'test_fn_success') {
      await this.updateDestStatus(event.test, DestState.PASSED);
    } else if (event.name === 'test_fn_failure') {
      await this.updateDestStatus(event.test, DestState.FAILED);
    } else {
      logger.error(`unhandled event: ${event.name}`);
    }
  }

  private async createDest(node: Node): Promise<void> {
    const destInfo = createDestInfoRecursive(node);
    this.destDatas = await this.client.createDest([destInfo]);
  }

  private async updateDestStatus(node: Node, status: DestState): Promise<void> {
    const paths = createPaths(node);
    const destId = findDestIdRecursive(this.destDatas, paths);
    if (!destId) {
      return;
    }
    logger.info(`update dest status`, {
      paths,
      destId,
      status,
    });
    return this.client.updateDestStatus(destId, status, new Date().toISOString());
  }
}

export class StepReporterFactory {
  constructor(readonly options: StepOptions) {}

  create(): StepReporter {
    if (!this.options.apiBaseUrl) {
      logger.warn('apiBaseUrl is not set. StepReporter is disabled.');
      return new NullStepReporter();
    }
    return new StepReporterImpl(this.options);
  }
}
