import { Job } from './job';
import { Unit } from './unit';

export class BeforeAll extends Unit {
  constructor(parent: Job, fn: () => void | Promise<void>) {
    super(parent, 'beforeAll', 'beforeAll', fn);
  }
}
