import { AsyncClosable } from '@dogu-tech/common';
import { ChildProcess } from 'child_process';

export class GameProfileReporterContext implements AsyncClosable {
  constructor(private readonly child: ChildProcess) {}

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.child.once('exit', () => {
        resolve();
      });
      this.child.once('error', (error) => {
        reject(error);
      });
      this.child.kill();
    });
  }
}
