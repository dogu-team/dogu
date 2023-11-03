import './env';

import { Executor } from './executors/executor';
import { WebResponsiveExecutor } from './executors/webResponsiveExecutor';

interface ExecutorMap {
  [name: string]: Executor;
}

(async () => {
  const executors: ExecutorMap = {
    'web-responsive': new Executor('web-responsive', WebResponsiveExecutor.run),
  };

  const { MAX_PARALLEL, GOOGLE_CLOUD_RUN, EXECUTOR_NAME } = process.env;
  const organizationId = process.argv[2];
  const testExecutorId = process.argv[3];
  const urls = process.argv[4].split(';');

  console.log('MAX PARALLEL:', MAX_PARALLEL);
  console.log('GOOGLE CLOUD RUN:', GOOGLE_CLOUD_RUN);
  console.log('ORGANIZATION ID:', organizationId);
  console.log('TEST EXECUTOR ID:', testExecutorId);
  console.log('EXECUTOR NAME:', EXECUTOR_NAME);
  console.log('URLS:', urls);

  await executors[EXECUTOR_NAME].run({ organizationId, testExecutorId, urls });
})();
