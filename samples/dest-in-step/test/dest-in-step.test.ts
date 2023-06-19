import { afterAll, afterEach, beforeAll, beforeEach, Dest, job, test } from '@dogu-tech/console-dest';

Dest.withOptions({
  timeout: 1000,
  logToFile: true,
}).describe(async ({ logger }) => {
  job('test-job', () => {
    beforeAll(async () => {
      logger.info('beforeAll');
      // await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    afterAll(async () => {
      logger.info('afterAll');
      // await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    beforeEach(async () => {
      logger.info('beforeEach');
      // await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    afterEach(async () => {
      logger.info('afterEach');
      // await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    test('test0-1', async () => {
      logger.info('test0-1');
      // await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    job('test-job-1', () => {
      beforeEach(async () => {
        logger.info('beforeEach');
        // await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      afterEach(async () => {
        logger.info('afterEach');
        // await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      test('test1-1', async () => {
        logger.info('test1-1');
        // await new Promise((resolve) => setTimeout(resolve, 1000));
      });
      test('test1-2', () => {
        logger.info('hello dest');
      });

      job('test-job-1-2', () => {
        beforeAll(async () => {
          logger.info('beforeAll');
          // await new Promise((resolve) => setTimeout(resolve, 1000));
        });

        afterAll(async () => {
          logger.info('afterAll');
          // await new Promise((resolve) => setTimeout(resolve, 1000));
        });

        test('test1-2-1', () => {
          logger.info('hello dest');
          // throw new Error('test');
        });
        test('test1-2-2', () => {
          logger.info('hello dest');
        });
      });
    });

    test('test0-2', async () => {
      logger.info('test0-2');
      // await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    job('test-job-2', () => {
      beforeEach(async () => {
        logger.info('beforeEach');
        // await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      afterEach(async () => {
        logger.info('afterEach');
        // await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      test('test2-1', async () => {
        logger.info('test2-1');
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        throw new Error('test');
      });
      test('test2-2', () => {
        logger.info('hello dest');
      });

      job('test-job-2-2', () => {
        test('test2-2-1', async () => {
          logger.info('test2-2-1');
          // await new Promise((resolve) => setTimeout(resolve, 1000));
        });
        test('test2-2-2', () => {
          logger.info('hello dest');
        });
      });
    });
  });
});
