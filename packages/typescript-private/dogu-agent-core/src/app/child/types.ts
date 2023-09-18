import { ChildCode, Status } from '@dogu-private/dost-children';
import { Instance, Printable, ProcessInfo, PromiseOrValue } from '@dogu-tech/common';
import { isFreePort } from '@dogu-tech/node';
import { ForkOptions } from 'child_process';
import { findFreePorts } from 'find-free-ports';
import { ChildKey } from '../../shares/child';

export type HostAgentConnectionStatus = Instance<typeof Status.getConnectionStatus.responseBody>;

export interface ChildTree {
  info: ProcessInfo;
  children: ChildTree[];
}

export interface ChildLastError {
  code: ChildCode;
  message: string;
}

export interface Child {
  open(): Promise<void>;
  close(): Promise<void>;
  openable(): PromiseOrValue<boolean>;
  lastError(): ChildLastError | undefined;
  isActive(): Promise<boolean>;
}

export interface ChildOptions {
  forkOptions?: ForkOptions;
  childLogger: Printable;
}

export type FilledChildOptions = Required<ChildOptions>;

function mergeChildOptions(options: ChildOptions): Required<ChildOptions> {
  return {
    forkOptions: {},
    ...options,
  };
}

export async function fillChildOptions(options: ChildOptions): Promise<FilledChildOptions> {
  const { forkOptions, childLogger } = mergeChildOptions(options);
  const execArgv = forkOptions.execArgv || [];
  const isDebugging = process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS.includes('--inspect') : false;
  if (isDebugging) {
    const hasDebugMode = execArgv ? execArgv.findIndex((arg) => arg.startsWith('--inspect')) !== -1 : false;
    if (!hasDebugMode) {
      const ports = await findFreePorts(1, { isFree: isFreePort });
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

export type ChildMap = Record<ChildKey, Child>;

export interface ChildListener {
  onStdout(key: ChildKey, data: string): void;
  onStderr(key: ChildKey, data: string): void;
  onClose(key: ChildKey, code: number | null, signal: NodeJS.Signals | null): void;
}
