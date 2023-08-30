import { ChildCode } from '@dogu-private/dost-children';
import { Printable } from '@dogu-tech/common';
import { ForkOptions } from 'child_process';
import { findFreePorts } from 'find-free-ports';
import lodash from 'lodash';
import { logger } from '../log/logger.instance';

export interface ChildLastError {
  code: ChildCode;
  message: string;
}

export interface Child {
  open(): Promise<void>;
  close(): Promise<void>;
  openable(): Promise<boolean>;
  lastError(): ChildLastError | undefined;
  isActive(): Promise<boolean>;
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
  const isDebugging = process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS.includes('--inspect') : false;
  if (isDebugging) {
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
