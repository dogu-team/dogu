import { execSync } from 'child_process';
import pidtree from 'pidtree';
import { logger } from './logger/logger.instance';

export function addProcessEventHandler(): void {
  process.on('exit', (code) => () => {
    pidtree(process.pid, (err, pids) => {
      if (err) {
        logger.error('child process close. pidtree error', { error: err });
      } else {
        logger.info('child process close. pidtree', { pids });
        for (const pid of pids) {
          killPid(pid);
        }
      }
      killPid(process.pid);
    });
  });
}

function killPid(pid: number): void {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /F /T`);
    } else {
      execSync(`kill -9 ${pid}`);
    }
    logger.info(`child process close. killed `, { pid });
  } catch (e) {
    logger.warn('child process close. kill error', { error: e });
  }
}
