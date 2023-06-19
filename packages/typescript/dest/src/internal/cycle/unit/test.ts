import { Job } from './job';
import { Unit } from './unit';

export class Test extends Unit {
  constructor(parent: Job, name: string, fn: () => void | Promise<void>) {
    super(parent, name, 'test', fn);
  }
}
