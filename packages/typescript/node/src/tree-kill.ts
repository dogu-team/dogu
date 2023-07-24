import { ChildProcess } from 'child_process';
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
