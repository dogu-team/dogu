import { Printable } from '@dogu-tech/common';
import { ChildProcess, execFileSync, execSync, fork } from 'child_process';
import path from 'path';
import pidtree from 'pidtree';
import treeKill from 'tree-kill';

export { treeKill };

export type Pid = string | number;

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

export function killProcess(pid?: Pid): void {
  if (pid === undefined) {
    return;
  }

  if (process.platform === 'win32') {
    killProcessUsingTaskkillOnWindows(pid);
  } else {
    killProcessUsingFork(pid);
  }
}

export function killProcessUsingTaskkillOnWindows(pid?: Pid): void {
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

export function killProcessUsingFork(pid?: Pid): void {
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

export function killProcessIgnore(pid: Pid, ignorePids: Pid[], printable: Printable): void {
  if (pid === undefined) {
    return;
  }

  pidtree(pid, (err, pids) => {
    if (err) {
      printable.error('child process close. pidtree error', { error: err });
    } else {
      printable.info('child process close. pidtree', { pids });
      for (const childPid of pids) {
        if (ignorePids.includes(childPid)) {
          continue;
        }
        killPid(childPid, printable);
      }
    }
    if (ignorePids.includes(pid)) {
      return;
    }
    killPid(pid, printable);
  });
}

function killPid(pid: Pid, printable: Printable): void {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /F`, { timeout: 10000 });
    } else {
      execSync(`kill -9 ${pid}`, { timeout: 10000 });
    }
    printable.info(`child process close. killed `, { pid });
  } catch (e) {
    printable.warn?.('child process close. kill error', { error: e });
  }
}
