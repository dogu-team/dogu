import { Printable } from '@dogu-tech/common';
import { ChildProcess, ForkOptions } from 'child_process';
import isDev from 'electron-is-dev';
import { findFreePorts } from 'find-free-ports';
import lodash from 'lodash';
import { logger } from '../log/logger.instance';

export interface Child {
  open(): Promise<ChildProcess>;
  openable(): Promise<boolean>;
  setOnChangeHandler(): void;
}

export interface ChildOptions {
  /**
   * @default {}
   */
  forkOptions?: ForkOptions;

  /**
   * @default logger
   */
  childLogger?: Printable;
}

export type FilledChildOptions = Required<ChildOptions>;

function defaultChildOptions(): FilledChildOptions {
  return {
    forkOptions: {},
    childLogger: logger,
  };
}

export async function fillChildOptions(options?: ChildOptions): Promise<FilledChildOptions> {
  const { forkOptions, childLogger } = lodash.merge(defaultChildOptions(), options);
  const execArgv = forkOptions.execArgv || [];
  if (isDev) {
    const hasDebugMode = execArgv ? execArgv.findIndex((arg) => arg.startsWith('--inspect')) !== -1 : false;
    if (!hasDebugMode) {
      const ports = await findFreePorts(1);
      if (ports.length !== 1) {
        throw new Error('invalid findFreePorts result');
      }
      execArgv.push(`--inspect=${ports[0]}`);
    }
  }
  return {
    forkOptions: {
      ...forkOptions,
      stdio: 'pipe',
      execArgv,
    },
    childLogger,
  };
}
