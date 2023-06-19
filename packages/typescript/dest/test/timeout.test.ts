import { job, test, Runner } from '../src/index';

job('timeout job', () => {
  test('timeout test 2', async () => {
    function timeout(): Promise<any> {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('');
        }, 100 * 1000);
      });
    }

    await timeout();
  });
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
void (async () => {
  await Runner.run();
})();
