import { BufferLogger, errorify, MixedLogger, Printable, stringify } from '@dogu-tech/common';
import childProcess from 'child_process';
import lodash from 'lodash';
import { HostPaths } from '.';
import { ChildProcessError } from './errors/child-process-error';

type ExecOptions = {
  encoding: BufferEncoding;
} & childProcess.ExecOptions;

function defaultExecOptions(): ExecOptions {
  return {
    encoding: 'utf8',
    timeout: 20 * 1000,
    shell: process.platform === 'win32' ? 'cmd.exe' : undefined,
    cwd: HostPaths.doguHomePath,
  };
}

function fillExecOptions(options: childProcess.ExecOptions): ExecOptions {
  return lodash.merge(defaultExecOptions(), options);
}

export interface ExecResult {
  stdout: string;
  stderr: string;
}

export async function exec(command: string, options: childProcess.ExecOptions): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, fillExecOptions(options), (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

export async function execIgnoreError(command: string, options: childProcess.ExecOptions, printable: Printable): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, fillExecOptions(options), (error, stdout, stderr) => {
      if (error) {
        if (error.code) {
          if (error.code === 0) {
            reject(new Error(`Unexpected error: ${stringify(error)}`));
          } else {
            printable.warn?.(`exec error treat as warning`, { command, error });
            resolve({ stdout, stderr });
          }
        } else if (error.signal) {
          if (error.signal === 'SIGTERM') {
            printable.error(`exec timeout`, { command, error });
            resolve({ stdout, stderr });
          } else {
            printable.warn?.(`exec error treat as warning`, { command, error });
            resolve({ stdout, stderr });
          }
        } else {
          reject(new Error(`Unexpected error: ${stringify(error)}`));
        }
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/**
 * @note When running with cmd, even if the process dies, the child process does not die together..
 */
export function spawnSync(command: string, args: string[], options: childProcess.SpawnOptions, printable: Printable): childProcess.ChildProcess {
  const commandAndArgs = `${command} ${args.join(' ')}`;
  printable.verbose?.(`spawn: ${commandAndArgs}`);
  const proc = childProcess.spawn(command, args, {
    shell: process.platform === 'win32' ? 'cmd.exe' : undefined,
    windowsVerbatimArguments: true,
    ...options,
  });
  proc.on('spawn', () => {
    printable.verbose?.(`spawned: ${commandAndArgs}`);
  });
  proc.stdout?.setEncoding('utf8');
  proc.stdout?.on('data', (data) => {
    printable.info(String(data));
  });

  proc.stderr?.setEncoding('utf8');
  proc.stderr?.on('data', (data) => {
    printable.error(String(data));
  });
  proc.on('error', (err) => {
    printable.error?.(`error: ${stringify(err)}`);
  });

  return proc;
}

export async function spawn(command: string, args: string[], options: childProcess.SpawnOptions, stream: Printable): Promise<childProcess.ChildProcess> {
  return new Promise((resolve) => {
    const proc = spawnSync(command, args, options, stream);
    resolve(proc);
  });
}

export async function spawnAndWait(command: string, args: string[], options: childProcess.SpawnOptions, printable: Printable): Promise<childProcess.ChildProcess> {
  const bufferLogger = new BufferLogger({ limit: 100 });
  const loggerWrap = new MixedLogger([printable, bufferLogger]);

  return new Promise((resolve, reject) => {
    const commandAndArgs = `${command} ${args.join(' ')}`;
    const proc = spawnSync(command, args, options, printable);

    proc.on('close', (code: number | null, signal: NodeJS.Signals | null) => {
      if (code != null) {
        if (code == 0) {
          resolve(proc);
        } else {
          reject(new ChildProcessError(commandAndArgs, code, signal, bufferLogger));
        }
      } else {
        reject(new ChildProcessError(commandAndArgs, code, signal, bufferLogger));
      }
    });
  });
}

export function defaultShell(): string | true | undefined {
  return process.platform === 'linux' ? '/bin/bash' : true;
}

async function _initialize(): Promise<void> {
  // Responding to Windows Hangul encoding broken problem
  if (process.platform === 'win32') {
    await exec('chcp 65001', {});
  }
}

//#region

export function isSigtermError(e: unknown): boolean {
  const error = errorify(e) as childProcess.ExecException;
  if (!error.signal) {
    return false;
  }
  return error.signal === 'SIGTERM';
}

//#endregion

(async (): Promise<void> => {
  await _initialize();
})().catch((reason) => console.error(reason));
