import { Job } from './job';
import { Unit } from './unit';

export class BeforeEach extends Unit {
  constructor(parent: Job, fn: () => void | Promise<void>) {
    super(parent, 'beforeEach', 'beforeEach', fn);
  }
}
