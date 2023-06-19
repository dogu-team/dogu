import { Dest, job, test } from '@dogu-tech/dest';

Dest.describe(({ logger }) => {
  job('my first test', () => {
    test('my first test case', () => {
      logger.info('hello world');
    });
  });
});
