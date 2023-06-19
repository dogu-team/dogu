import { retry, stringify } from '@dogu-tech/common';
import child_process from 'child_process';
import fs from 'fs';
import lodash from 'lodash';
import shelljs, { ShellString } from 'shelljs';

export interface ShellOptions {
  /**
   * @default 'Error: Command failed'
   */
  errorMessage: string;
}

export function defaultShellOptions(): Required<ShellOptions> {
  return {
    errorMessage: 'Error: Command failed',
  };
}

export function fillShellOptions(options?: ShellOptions): Required<ShellOptions> {
  return lodash.merge(defaultShellOptions(), options);
}

export interface ExecOptions extends ShellOptions {
  /**
   * @default false
   */
  retry?: boolean;

  /**
   * @default 3
   */
  retryCount?: number;

  /**
   * @default 2000
   * @unit milliseconds
   */
  retryInterval?: number;
}

export function defaultExecOptions(): Required<ExecOptions> {
  return lodash.merge(defaultShellOptions(), {
    retry: false,
    retryCount: 3,
    retryInterval: 1000,
  });
}

export function fillExecOptions(options?: ExecOptions): Required<ExecOptions> {
  return lodash.merge(defaultExecOptions(), options);
}

export function which(command: string, options?: ShellOptions): ShellString {
  const { errorMessage } = fillShellOptions(options);

  const result = shelljs.which(command);
  if (!result) {
    shelljs.echo(errorMessage);
    shelljs.exit(1);
  }
  return result;
}

export async function exec(command: string, options?: ExecOptions): Promise<ShellString> {
  const { errorMessage, retry: retry_, retryCount, retryInterval } = fillExecOptions(options);

  let result: ShellString | null = null;
  if (retry_) {
    result = await retry<ShellString>(
      () => {
        return shelljs.exec(command);
      },
      {
        retryCount: retryCount,
        retryInterval: retryInterval,
      },
    );
  } else {
    result = shelljs.exec(command);
  }

  if (result === null || result.code !== 0) {
    shelljs.echo(errorMessage);
    shelljs.exit(1);
  }
  return result;
}

export async function spawnWithFindPattern(command: string, args: string[], pattern: RegExp): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const options = process.platform === 'win32' ? { shell: 'cmd.exe', windowsVerbatimArguments: true } : undefined;
    const child = child_process.spawn(command, args, options);
    let matched = false;
    child.on('close', (code, signal) => {
      if (matched) {
        // noop
      } else if (code === 0) {
        resolve();
      } else if (code !== 0) {
        reject(new Error(`Child process exited with code ${stringify(code)}`));
      } else if (signal) {
        reject(new Error(`Child process exited with signal ${signal}`));
      } else {
        reject(new Error('Child process exited with unknown error'));
      }
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
      const dataString = String(data);
      console.log(dataString);
      if (!matched) {
        matched = dataString.match(pattern) !== null;
        if (matched) {
          console.log('Matched. Killing child process...');
          child.kill();
          resolve();
        }
      }
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
      console.error(data);
    });
  });
}

export function access(path: string, mode: number, options?: ShellOptions): void {
  const { errorMessage } = fillShellOptions(options);

  try {
    fs.accessSync(path, mode);
  } catch (error) {
    shelljs.echo(errorMessage);
    shelljs.exit(1);
  }
}

export async function execute<Result>(message: string, fn: () => Promise<Result> | Result): Promise<Result> {
  shelljs.echo(message);
  const result = await fn();
  return result;
}
