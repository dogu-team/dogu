import { Printable } from '@dogu-tech/common';
import { killChildProcess, treeKill } from '@dogu-tech/node';
import * as Sentry from '@sentry/electron/main';
import { ChildProcess, fork } from 'child_process';
import pidtree from 'pidtree';
import { Key } from 'react';
import { FeatureConfigService } from '../../feature-config/feature-config-service';
import { logger } from '../../log/logger.instance';
import { stripAnsi } from '../../log/strip-ansi';
import { FilledChildOptions } from '../types';

export function openChild(key: Key, module: string, options: FilledChildOptions, featureConfigService: FeatureConfigService): ChildProcess {
  const { forkOptions, childLogger } = options;
  const child = fork(module, forkOptions);
  child.stdout?.setEncoding('utf8');
  child.stderr?.setEncoding('utf8');
  child.on('spawn', () => {
    childLogger.info('child process spawned', { key });
  });
  child.stdout?.on('data', (data) => {
    const dataString = data.toString();
    const stripped = stripAnsi(dataString);
    childLogger.info(`[${key}] ${stripped}`);
    if (featureConfigService.get('useSentry')) {
      Sentry.addBreadcrumb({
        type: 'default',
        category: key as string,
        message: stripped,
        level: 'info',
      });
    }
  });
  child.stderr?.on('data', (data) => {
    const dataString = data.toString();
    const stripped = stripAnsi(dataString);
    childLogger.warn?.(`[${key}] ${stripped}`);
    if (featureConfigService.get('useSentry')) {
      Sentry.addBreadcrumb({
        type: 'default',
        category: key as string,
        message: stripped,
        level: 'error',
      });
    }
  });
  child.on('error', (error) => {
    childLogger.error('child process error', { key, error });
  });
  child.on('close', (code, signal) => {
    childLogger.info('child process exited', { key, code, signal });
    if (code !== 0) {
      if (featureConfigService.get('useSentry')) {
        Sentry.addBreadcrumb({
          type: 'default',
          category: key as string,
          message: `child process(${key}) exited with code ${code} and signal ${signal}`,
          level: 'fatal',
        });
      }
    }
  });
  child.on('message', (message, sendHandle) => {
    childLogger.info('child process message', { key, message, sendHandle });
  });
  return child;
}

export async function closeChild(key: Key, child: ChildProcess, childLogger: Printable): Promise<void> {
  childLogger.info('child process close called', { err: new Error().stack });
  try {
    await killChildProcess(child);
  } catch (error) {
    childLogger.error('child process close error', { key, error });
  }
}

export function closeAllChildren(): Promise<void> {
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
