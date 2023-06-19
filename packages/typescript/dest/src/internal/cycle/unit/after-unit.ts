import { DestPropagatableState } from '@dogu-tech/types';
import { Job } from './job';
import { Unit, UnitType } from './unit';

export class AfterUnit extends Unit {
  constructor(parent: Job, public before: Unit, name: string, type: UnitType, fn: () => void | Promise<void>) {
    super(parent, name, type, fn);
  }

  override async onStatePropagated(state: DestPropagatableState): Promise<void> {
    if (state === 'skipped') {
      if (this.before.isStateCompleted()) {
        if (this.before.state === 'skipped') {
          return this.setState('skipped');
        } else if (this.before.state === 'passed' || this.before.state === 'failed') {
          return Promise.resolve();
        }
      }
    }
    return super.onStatePropagated(state);
  }
}
