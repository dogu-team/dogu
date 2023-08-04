import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import { Circus } from '@jest/types';
import { isAxiosError } from 'axios';
import { TestEnvironment } from 'jest-environment-node';
import _ from 'lodash';

import { createLogger, initAxios } from './common-utils.js';
import { DoguConfig, DoguConfigFactory } from './dogu-config.js';
import { DriverFactory } from './driver-factory.js';
import { JestDescribeNode, JestNode, JestUniqueNode } from './jest-utils.js';
import { createJestInfoRecursive, DestHandler, DestState } from './protocols/common.js';
import { RemoteDestHandlerFactory } from './protocols/remote-dest.handler.js';
import { RoutineDestHandlerFactory } from './protocols/routine-dest.handler.js';

const driver = 'driver';

declare global {
  /* @ts-ignore */
  const driver: Readonly<WebdriverIO.Browser>;
}

export class DoguEnvironment extends TestEnvironment {
  private logger = createLogger('DoguEnvironment');
  private doguConfig: DoguConfig | null = null;
  private destHandlers: DestHandler[] = [];
  private driver: WebdriverIO.Browser | null = null;
  private anyTestFailed = false;
  private scopeNode: JestUniqueNode | undefined = undefined;

  constructor(config: JestEnvironmentConfig, _context: EnvironmentContext) {
    super(config, _context);
  }

  override async setup(): Promise<void> {
    await super.setup();
    initAxios();

    this.doguConfig = await new DoguConfigFactory().create();

    this.driver = await new DriverFactory().create(this.doguConfig);
    if (_.has(this.global, driver)) {
      throw new Error('globalThis.driver is already defined');
    }
    _.set(this.global, driver, this.driver);

    this.destHandlers.push(new RemoteDestHandlerFactory(this.doguConfig, this.driver).create());
    this.destHandlers.push(new RoutineDestHandlerFactory(this.doguConfig).create());
  }

  override async teardown(): Promise<void> {
    this.destHandlers = [];

    if (_.has(this.global, driver)) {
      _.unset(this.global, driver);
    }
    await this.driver?.deleteSession().catch((error) => {
      this.logger.error('deleteSession failed', error);
    });
    this.driver = null;

    this.doguConfig = null;
    await super.teardown();
  }

  async handleTestEvent(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): Promise<void> {
    try {
      await this.onTestEvent(event, state);
    } catch (error) {
      const parsedError = isAxiosError(error) ? error.toJSON() : error;
      this.logger.error('handleTestEvent failed', parsedError);
    }
  }

  private async onTestEvent(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): Promise<void> {
    this.logger.info(`onTestEvent ${event.name}`);
    this.processFailFast(event, state);

    if (
      event.name === 'setup' ||
      event.name === 'teardown' ||
      event.name === 'add_hook' ||
      event.name === 'start_describe_definition' ||
      event.name === 'finish_describe_definition' ||
      event.name === 'add_test' ||
      event.name === 'run_finish' ||
      event.name === 'test_started'
    ) {
      // noop
    } else if (event.name === 'run_start') {
      await this.createDest(state.rootDescribeBlock);
    } else if (event.name === 'run_describe_start') {
      this.pushScopeNode(event.describeBlock);
      await this.updateDest(event.describeBlock, DestState.RUNNING);
    } else if (event.name === 'run_describe_finish') {
      try {
        await this.updateDest(event.describeBlock, undefined);
      } catch (error) {
        this.logger.error('run_describe_finish failed', error);
      }
      this.popScopeNode();
    } else if (event.name === 'test_start') {
      this.pushScopeNode(event.test);
    } else if (event.name === 'test_fn_start') {
      await this.updateDest(event.test, DestState.RUNNING);
    } else if (event.name === 'test_fn_success') {
      await this.updateDest(event.test, DestState.PASSED);
    } else if (event.name === 'test_fn_failure') {
      await this.updateDest(event.test, DestState.FAILED);
    } else if (event.name === 'test_skip') {
      try {
        await this.updateDest(event.test, DestState.SKIPPED);
      } catch (error) {
        this.logger.error('test_skip failed', error);
      }
      this.popScopeNode();
    } else if (event.name === 'test_todo') {
      this.popScopeNode();
    } else if (event.name === 'test_done') {
      this.popScopeNode();
    } else if (event.name === 'hook_start') {
      await this.updateDest(event.hook, DestState.RUNNING);
    } else if (event.name === 'hook_success') {
      await this.updateDest(event.hook, DestState.PASSED);
    } else if (event.name === 'hook_failure') {
      await this.updateDest(event.hook, DestState.FAILED);
    } else {
      this.logger.error(`unhandled event: ${event.name}`);
    }
  }

  private processFailFast(event: Circus.SyncEvent | Circus.AsyncEvent, state: Circus.State): void {
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

  private pushScopeNode(jestUniqueNode: JestUniqueNode): void {
    this.scopeNode = jestUniqueNode;
  }

  private popScopeNode(): void {
    if (this.scopeNode) {
      this.scopeNode = this.scopeNode.parent;
    }
  }

  private async createDest(rootJestNode: JestDescribeNode): Promise<void> {
    const rootJestInfos = createJestInfoRecursive(rootJestNode);
    if (rootJestInfos.length !== 1) {
      throw new Error('Internal error. rootJestInfos.length !== 1');
    }
    const rootJestInfo = rootJestInfos[0];
    if (!rootJestInfo) {
      throw new Error('Internal error. rootJestInfo is null');
    }
    await Promise.all(this.destHandlers.map((destHandler) => destHandler.onCreate(rootJestInfo)));
  }

  private async updateDest(jestNode: JestNode, destState?: DestState): Promise<void> {
    await Promise.all(this.destHandlers.map((destHandler) => destHandler.onUpdate(this.scopeNode, jestNode, destState)));
  }
}
