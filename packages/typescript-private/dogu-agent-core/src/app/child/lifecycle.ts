import { Printable, stringify } from '@dogu-tech/common';
import { killChildProcess, treeKill } from '@dogu-tech/node';
import { ChildProcess, fork } from 'child_process';
import pidtree from 'pidtree';
import { ChildKey } from '../../shares/child';
import { stripAnsi } from '../log-utils';
import { ChildListener, FilledChildOptions } from './types';

export function openChild(key: ChildKey, module: string, options: FilledChildOptions, listener: ChildListener): ChildProcess {
  const { forkOptions, childLogger } = options;
  const child = fork(module, forkOptions);
  child.stdout?.setEncoding('utf8');
  child.stderr?.setEncoding('utf8');
  child.on('spawn', () => {
    childLogger.info('child process spawned', { key });
  });
  child.stdout?.on('data', (data) => {
    const dataString = stringify(data);
    const stripped = stripAnsi(dataString);
    childLogger.info(`[${key}] ${stripped}`);
    listener.onStdout(key, stripped);
  });
  child.stderr?.on('data', (data) => {
    const dataString = stringify(data);
    const stripped = stripAnsi(dataString);
    childLogger.warn?.(`[${key}] ${stripped}`);
    listener.onStderr(key, stripped);
  });
  child.on('error', (error) => {
    childLogger.error('child process error', { key, error });
  });
  child.on('close', (code, signal) => {
    childLogger.info('child process exited', { key, code, signal });
    listener.onClose(key, code, signal);
  });
  child.on('message', (message, sendHandle) => {
    childLogger.info('child process message', { key, message, sendHandle });
  });
  return child;
}

export async function closeChild(key: ChildKey, child: ChildProcess, childLogger: Printable): Promise<void> {
  childLogger.info('child process close called', { err: new Error().stack });
  try {
    await killChildProcess(child);
  } catch (error) {
    childLogger.error('child process close error', { key, error });
  }
}

export async function closeAllChildren(logger: Printable): Promise<void> {
  logger.info('closeAllChildren called', { err: new Error().stack });
  return new Promise((resolve) => {
    if (process.pid) {
      pidtree(process.pid, (err, pids) => {
        if (err) {
          logger.error('closeAllChildren close. pidtree error', { error: err });
        } else {
          logger.info('closeAllChildren close. pidtree', { pids });
          for (const pid of pids) {
            treeKill(pid, (error) => {
              if (error) {
                logger.error('closeAllChildren close. treeKill error', { error });
              } else {
                logger.info('closeAllChildren close. treeKill success', { pid });
              }
            });
          }
        }
        resolve();
      });
    } else {
      logger.warn?.('child process pid is null');
      resolve();
    }
  });
}
