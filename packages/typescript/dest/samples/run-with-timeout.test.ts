import { Dest, job, test } from '@dogu-tech/dest';

Dest.withOptions({
  timeout: 1000, // 1 seconds
}).describe(({ logger }) => {
  job('my first test', () => {
    test('my first test case', () => {
      logger.info('hello world');
    });

    test('my second test case', async () => {
      logger.info('hello world');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });
  });
});
