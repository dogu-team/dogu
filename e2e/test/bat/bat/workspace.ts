import { job, test } from '@dogu-tech/dest';
import { pathMap } from '../../../src/path-map';
import { ProcessManager } from '../../../src/process-manager';
import { Timer } from '../../../src/timer';

export function startConsole(consoleWebFrontPort: number): void {
  job('프로젝트 실행', () => {
    test('프로젝트 실행', async () => {
      const consoleWebFront = ProcessManager.spawn('yarn', ['workspace', 'console-web-front', 'run', 'dev', '-p', `${consoleWebFrontPort}`], {
        name: 'console-web-front',
        printLog: true,
        cwd: pathMap.root,
      });
      const consoleWebServer = ProcessManager.spawn('yarn', ['workspace', 'console-web-server', 'run', 'start'], {
        name: 'console-web-server',
        printLog: true,
        cwd: pathMap.root,
      });

      await Promise.all([
        Timer.waitStream(consoleWebFront, 'ready started server on', 2 * 60 * 1000),
        Timer.waitStream(consoleWebServer, 'ready - started server on', 2 * 60 * 1000),
      ]);
    });
  });
}
