import { stringify } from '@dogu-tech/common';
import chalk from 'chalk';
import { ChildProcess, ChildProcessWithoutNullStreams, exec, execSync, spawn as Spawn, SpawnOptionsWithoutStdio } from 'child_process';
import ON_DEATH from 'death';
import stc from 'string-to-color';
import util from 'util';

const execPromise = util.promisify(exec);

export interface ProcessOpenOptions {
  name: string;
  printLog?: boolean;
}

export module ProcessManager {
  const childProcesses: ChildProcess[] = [];

  export function spawn(command: string, args: ReadonlyArray<string>, options: SpawnOptionsWithoutStdio & ProcessOpenOptions): ChildProcessWithoutNullStreams {
    if (options.env) {
      Object.assign(options.env, process.env);
    }

    options = {
      shell: process.platform === 'win32' ? 'cmd.exe' : undefined,
      windowsVerbatimArguments: true,
      ...options,
    };

    const stream = Spawn(command, args, options);
    stream.on('close', (code, signal) => {
      remove(stream);
      console.log(`${tagWithColor} closed.`, {
        code,
        signal,
      });
    });

    console.log(`${util.inspect(command)} ${util.inspect(args)} ${util.inspect(options)}}`);

    const tagHexColor = stc(options.name);
    const tagWithColor = chalk.hex(tagHexColor)(`[${options.name}]`);

    if (options && options.printLog) {
      stream.stdout.on('data', (stdout: string | Buffer) => {
        console.log(`${tagWithColor} ${stdout.toString()}`);
      });

      stream.stderr.on('data', (stderr: string | Buffer) => {
        console.log(`${tagWithColor} ${stderr.toString()}`);
      });

      stream.stdout.on('error', (stdout: string | Buffer) => {
        console.log(`${tagWithColor} ${stdout.toString()}`);
      });

      stream.stderr.on('error', (stderr: string | Buffer) => {
        console.log(`${tagWithColor} ${stderr.toString()}`);
      });
    }

    add(stream);

    return stream;
  }

  export function spawnAndWait(command: string, args: ReadonlyArray<string>, options: SpawnOptionsWithoutStdio & ProcessOpenOptions): Promise<ChildProcessWithoutNullStreams> {
    return new Promise((resolve, reject) => {
      const stream = spawn(command, args, options);
      stream.on('close', (code, signal) => {
        if (code !== null && code === 0) {
          resolve(stream);
        } else {
          reject(new Error(`Process ${command} ${stringify(args)} exited with code ${stringify(code)} and signal ${stringify(signal)}`));
        }
      });
    });
  }

  function add(childProcess: ChildProcess): void {
    childProcesses.push(childProcess);
  }

  function remove(childProcess: ChildProcess): boolean {
    const index = childProcesses.indexOf(childProcess, 0);
    if (index > -1) {
      childProcesses.splice(index, 1);
      return true;
    }
    return false;
  }

  export async function killByNames(processNames: string[]): Promise<void> {
    const execes: ReturnType<typeof execPromise>[] = [];

    if (process.platform === 'win32') {
      for (const processName of processNames) {
        execes.push(execPromise(`taskkill /F /IM ${processName}`));
        execes.push(execPromise(`taskkill /F /IM ${processName}.exe`));
      }
    }

    if (process.platform === 'darwin') {
      for (const processName of processNames) {
        execes.push(execPromise(`pkill -9 ${processName}`));
      }
    }

    await Promise.all(execes).catch((error) => {
      console.error(`killByNames failed ${util.inspect(error)}`);
    });
  }

  export async function killByPorts(ports: number[]): Promise<void> {
    if (process.platform === 'win32') {
      await killByPortsOnWindows(ports);
    } else {
      await killByPortsOnUnix(ports);
    }
  }

  async function killByPortsOnWindows(ports: number[]): Promise<void> {
    const results = ports.map(async (port) => {
      return execPromise(`netstat -ano -p tcp | findstr LISTEN | findstr :${port}`)
        .then(({ stdout, stderr }) => {
          if (stderr.length > 0) {
            return Promise.reject(new Error(`Error while netstat: ${stderr}`));
          }
          return stdout.split(/\r*\n/).map((line) => {
            const match = line.match(/\s*TCP\s+\d+.\d+.\d+.\d+:\d+\s+\d+.\d+.\d+.\d+:\d+\s+LISTENING\s+(\d+)\s*/);
            if (!match || match.length < 2) {
              return new Error(`Error while netstat: ${line}`);
            }
            const pid = match[1].trim();
            if (pid.length === 0) {
              return new Error(`Error while netstat: ${line}`);
            }
            return pid;
          });
        })
        .then((pidOrErrors) => {
          return pidOrErrors.map((pidOrError) => {
            if (pidOrError instanceof Error) {
              return Promise.reject(pidOrError);
            }
            return execPromise(`taskkill /F /PID ${pidOrError}`);
          });
        })
        .then((results) => {
          return Promise.allSettled(results);
        });
    });
    await Promise.allSettled(results);
  }

  async function killByPortsOnUnix(ports: number[]): Promise<void> {
    const results = ports.map((port) => {
      return execPromise(`lsof -i -P | grep LISTEN | grep :${port}`)
        .then(({ stdout, stderr }) => {
          if (stderr.length > 0) {
            return Promise.reject(new Error(`Error while lsof: ${stderr}`));
          }
          return stdout.split(/\r*\n/).map((line) => {
            const match = line.split(/\s{1,}|\t/);
            // const match = line.match(/\s*[\w.]+\s+\d+\s+\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+[\w*]+:(\d+)\s+\(\w+\)\s*/);
            if (!match || match.length < 2) {
              return new Error(`Error while lsof: ${line}`);
            }
            const pid = match[1].trim();
            if (pid.length === 0) {
              return new Error(`Error while lsof: ${line}`);
            }
            console.log(`port ${port} is used by ${pid}`);
            return pid;
          });
        })
        .then((pidOrErrors) => {
          return pidOrErrors.map((pidOrError) => {
            if (pidOrError instanceof Error) {
              return Promise.reject(pidOrError);
            }
            console.log(`killing ${pidOrError}`);
            return execPromise(`kill -9 ${pidOrError}`);
          });
        })
        .then((results) => {
          return Promise.allSettled(results);
        });
    });
    await Promise.allSettled(results);
  }

  export function close(): void {
    console.log('Closing all processes');

    for (const childProcess of childProcesses) {
      if (childProcess.stdout) {
        childProcess.stdout.destroy();
      }

      if (childProcess.stderr) {
        childProcess.stderr.destroy();
      }

      if (process.platform === 'win32') {
        const pid = childProcess.pid;

        if (pid) {
          const output = execSync(`taskkill /F /PID ${pid}`);
          console.log(output.toString());
        } else {
          console.error("Can't find pid");
        }
      } else {
        childProcess.kill();
      }
    }
  }
}

const OFF_DEATH = ON_DEATH((signal) => {
  console.log(`ProcessManager.onDeath ${signal}`);
  ProcessManager.close();
  OFF_DEATH();
});
