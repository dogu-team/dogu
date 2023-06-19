import { Dest, job, test } from '@dogu-tech/dest';

Dest.describe(({ logger }) => {
  // ❌ this will throw an error. you must use job() to create a job.
  test('my first test case', () => {
    logger.info('hello world');
  });

  // ✅ this will work
  job('my first job', () => {
    test('my first test case', () => {
      logger.info('hello world');
    });
  });
});
