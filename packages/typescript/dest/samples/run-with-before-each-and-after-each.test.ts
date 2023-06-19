import { afterEach, beforeEach, Dest, job, test } from '@dogu-tech/dest';

Dest.describe(({ logger }) => {
  job('my first test', () => {
    beforeEach(() => {
      logger.info('beforeEach');
    });

    // this called after each test
    afterEach(() => {
      logger.info('afterEach');
    });

    test('my first test case', () => {
      logger.info('hello world');
    });

    test('my second test case', () => {
      logger.info('hello world');
    });
  });
});
