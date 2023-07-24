import { AsyncClosable } from '@dogu-tech/common';
import { killChildProcess } from '@dogu-tech/node';
import { ChildProcess } from 'child_process';

export class GameProfileReporterContext implements AsyncClosable {
  constructor(private readonly child: ChildProcess) {}

  close(): Promise<void> {
    return killChildProcess(this.child);
  }
}
