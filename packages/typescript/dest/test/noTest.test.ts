import { Runner } from '../src/runner/runner';
import { job } from '../src/index';

// eslint-disable-next-line @typescript-eslint/no-empty-function
job('job without test', () => {});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
void (async () => {
  await Runner.run();
})();
