import { ChildProcess, fork } from 'child_process';
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
