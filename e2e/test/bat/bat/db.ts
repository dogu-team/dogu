import { job, test } from '@dogu-tech/dest';
import { pathMap } from '../../../src/path-map';
import { ProcessManager } from '../../../src/process-manager';

export function prepareDB(): void {
  job('DB 실행', () => {
    test('DB 실행', async () => {
      process.env.CI = 'e2e';

      const pgsqlPromise = ProcessManager.spawnAndWait('yarn', ['workspace', 'console-web-server', 'run', 'start:pgsql'], {
        name: 'dogu-pgsql',
        printLog: true,
        cwd: pathMap.root,
      });

      const redisPromise = ProcessManager.spawnAndWait('yarn', ['workspace', 'console-web-server', 'run', 'start:redis'], {
        name: 'dogu-redis',
        printLog: true,
        cwd: pathMap.root,
      });

      await Promise.all([pgsqlPromise, redisPromise]);
    });
  });
}
