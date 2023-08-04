import { job, test } from '@dogu-tech/dest';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { pathMap } from '../../../src/path-map';
import { ProcessManager } from '../../../src/process-manager';
import { Timer } from '../../../src/timer';
import { Dost } from './host';

export function startConsoleAndDost(consoleWebFrontPort: number): { dost: Dost } {
  const consoleWebFront = new ConsoleWebFront(consoleWebFrontPort);
  const consoleWebServer = new ConsoleWebServer();
  const dost = new Dost();

  job('Execute project', () => {
    test('Execute project', async () => {
      consoleWebFront.start();
      consoleWebServer.start();
      await Promise.all([consoleWebFront.wait(), consoleWebServer.wait()]);
    });

    dost.nextTest();
    dost.nextTest();
  });
  return { dost: dost };
}

export function startDost(): { dost: Dost } {
  const dost = new Dost();
  job('Execute dost', () => {
    dost.nextTest();
    dost.nextTest();
  });
  return { dost: dost };
}

class ConsoleWebFront {
  private proc: ChildProcessWithoutNullStreams | undefined = undefined;
  constructor(readonly consoleWebFrontPort: number) {
    this.consoleWebFrontPort = consoleWebFrontPort;
  }

  start(): void {
    this.proc = ProcessManager.spawn('yarn', ['workspace', 'console-web-front', 'run', 'start', '-H', '127.0.0.1', '-p', `${this.consoleWebFrontPort}`], {
      name: 'console-web-front',
      printLog: true,
      cwd: pathMap.root,
    });
  }
  wait(): Promise<void> {
    return Timer.waitStream(this.proc!, 'ready started server on', 2 * 60 * 1000);
  }
}

class ConsoleWebServer {
  private proc: ChildProcessWithoutNullStreams | undefined = undefined;
  constructor() {}

  start(): void {
    this.proc = ProcessManager.spawn('yarn', ['workspace', 'console-web-server', 'run', 'start'], {
      name: 'console-web-server',
      printLog: true,
      cwd: pathMap.root,
    });
  }

  wait(): Promise<void> {
    return Timer.waitStream(this.proc!, 'ready - started server on', 2 * 60 * 1000);
  }
}
