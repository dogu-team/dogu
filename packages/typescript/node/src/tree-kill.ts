import { ChildProcess, execFileSync, fork } from 'child_process';
import path from 'path';
import treeKill from 'tree-kill';

export { treeKill };

export function killChildProcess(childProcess: ChildProcess, signal: string | number = 'SIGTERM'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (childProcess.pid === undefined || childProcess.exitCode !== null || childProcess.signalCode !== null) {
      resolve();
      return;
    }
    treeKill(childProcess.pid, signal, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function killProcess(pid?: string | number): void {
  if (pid === undefined) {
    return;
  }

  if (process.platform === 'win32') {
    killProcessUsingTaskkillOnWindows(pid);
  } else {
    killProcessUsingFork(pid);
  }
}

export function killProcessUsingTaskkillOnWindows(pid?: string | number): void {
  if (pid === undefined) {
    return;
  }

  if (process.platform !== 'win32') {
    throw new Error('killProcessUsingTaskkillOnWindows is only available on Windows');
  }

  try {
    execFileSync('taskkill', ['/T', '/F', '/PID', pid.toString()], {
      stdio: 'ignore',
    });
  } catch (error) {
    // ignore
  }
}

export function killProcessUsingFork(pid?: string | number): void {
  if (pid === undefined) {
    return;
  }
  const scriptPath = path.resolve(__dirname, 'scripts', 'kill-process.js');
  const child = fork(scriptPath, [pid.toString()], {
    stdio: 'ignore',
    detached: true,
  });
  child.unref();
}

export function killSelfProcess(): void {
  killProcess(process.pid);
}
