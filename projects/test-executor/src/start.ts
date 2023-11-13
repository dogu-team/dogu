/* eslint-disable @typescript-eslint/explicit-function-return-type */

import './env';

import { EventEmitter } from 'events';
import { Executor } from './executors/executor';
import { WebResponsiveExecutor } from './executors/webResponsiveExecutor';

interface ExecutorMap {
  [name: string]: Executor;
}

void (async () => {
  const executors: ExecutorMap = {
    'web-responsive': new WebResponsiveExecutor(),
  };

  const { MAX_PARALLEL, GOOGLE_CLOUD_RUN, EXECUTOR_NAME } = process.env;
  console.log('MAX PARALLEL:', MAX_PARALLEL);
  console.log('GOOGLE CLOUD RUN:', GOOGLE_CLOUD_RUN);
  console.log('EXECUTOR NAME:', EXECUTOR_NAME);

  EventEmitter.defaultMaxListeners = Number(MAX_PARALLEL) + 10;
  executors[EXECUTOR_NAME].init();
  await executors[EXECUTOR_NAME].run();
})();
