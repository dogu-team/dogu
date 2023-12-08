import { killProcess } from '@dogu-tech/node';
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
          killProcess(pid);
        }
      }
      killProcess(process.pid);
    });
  });
}
