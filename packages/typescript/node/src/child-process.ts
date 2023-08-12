import { NullLogger, Printable, stringify } from '@dogu-tech/common';
import childProcess from 'child_process';
import lodash from 'lodash';

type ExecOptions = {
  encoding: BufferEncoding;
} & childProcess.ExecOptions;

function defaultExecOptions(): ExecOptions {
  return {
    encoding: 'utf8',
    timeout: 20 * 1000,
    shell: process.platform === 'win32' ? 'cmd.exe' : undefined,
  };
}

function fillExecOptions(options: childProcess.ExecOptions): ExecOptions {
  return lodash.merge(defaultExecOptions(), options);
}

export interface ExecResult {
  stdout: string;
  stderr: string;
}

export function exec(command: string, options: childProcess.ExecOptions, printable: Printable): Promise<ExecResult> {
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

export function execIgnoreError(command: string, options: childProcess.ExecOptions, printable: Printable): Promise<ExecResult> {
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
            reject(error);
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
  printable.verbose?.(`spawn ${command} ${stringify(args)}`);
  const proc = childProcess.spawn(command, args, {
    shell: process.platform === 'win32' ? 'cmd.exe' : undefined,
    windowsVerbatimArguments: true,
    ...options,
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

export async function spawnAndWait(command: string, args: string[], options: childProcess.SpawnOptions, stream: Printable): Promise<childProcess.ChildProcess> {
  const appendLog = (data: string, dest: { str: string }): void => {
    dest.str += data;
    const diff = dest.str.length - 1000;
    if (0 < diff) {
      dest.str = dest.str.slice(Math.min(999, diff));
    }
  };

  return new Promise((resolve, reject) => {
    const commandAndArgs = `${command} ${args.join(' ')}`;
    const proc = spawnSync(command, args, options, stream);
    const logs = { str: '' };
    proc.stdout?.setEncoding('utf8');
    proc.stdout?.on('data', (data) => {
      appendLog(String(data), logs);
    });

    proc.stderr?.setEncoding('utf8');
    proc.stderr?.on('data', (data) => {
      appendLog(String(data), logs);
    });
    proc.on('spawn', () => {
      stream.verbose?.(`spawned: ${commandAndArgs}`);
    });
    proc.on('error', (err) => {
      stream.error?.(`error: ${commandAndArgs} ${stringify(err)}`);
    });
    proc.on('close', (code: number | null, signal: NodeJS.Signals | null) => {
      if (code != null) {
        if (code == 0) {
          resolve(proc);
        } else {
          reject(new Error(`command: ${commandAndArgs} failed.\n returned code: ${code}\n last logs: ${logs.str}`));
        }
      } else {
        if (signal) {
          reject(new Error(`command: ${commandAndArgs} failed.\n received signal: ${signal}\n last logs: ${logs.str}`));
        } else {
          throw new Error(`command: ${commandAndArgs} failed.\n unhandled case`);
        }
      }
    });
  });
}

async function _initialize(): Promise<void> {
  // Responding to Windows Hangul encoding broken problem
  if (process.platform === 'win32') {
    await exec('chcp 65001', {}, NullLogger.instance);
  }
}

(async (): Promise<void> => {
  await _initialize();
})().catch((reason) => console.error(reason));
