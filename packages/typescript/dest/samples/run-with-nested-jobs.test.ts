import { Dest, job, test } from '@dogu-tech/dest';

Dest.describe(({ logger }) => {
  // ✅ nested jobs
  job('my first test', () => {
    job('my nested test', () => {
      test('my second test case', () => {
        logger.info('hello world');
      });
    });
  });

  // ❌ nested tests. this will throw an error.
  job('my second test', () => {
    test('my second test case', () => {
      test('my nested test case', () => {
        logger.info('hello world');
      });
    });
  });
});
