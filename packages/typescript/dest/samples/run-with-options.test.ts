import { Dest, job, test } from '@dogu-tech/dest';

Dest.withOptions({
  timeout: 60 * 60 * 1000, // 1 hour
  logToFile: true,
}).describe(({ logger }) => {
  job('my first test', () => {
    test('my first test case', () => {
      logger.info('hello world');
    });
  });
});
