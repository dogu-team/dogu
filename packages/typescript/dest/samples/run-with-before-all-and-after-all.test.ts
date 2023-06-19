import { afterAll, beforeAll, Dest, job, test } from '@dogu-tech/dest';

Dest.describe(({ logger }) => {
  job('my first test', () => {
    beforeAll(() => {
      logger.info('beforeAll');
    });

    // this called after same level tests
    afterAll(() => {
      logger.info('afterAll');
    });

    test('my first test case', () => {
      logger.info('hello world');
    });

    test('my second test case', () => {
      logger.info('hello world');
    });
  });
});
