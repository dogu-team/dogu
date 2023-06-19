import { AfterUnit } from './after-unit';
import { BeforeAll } from './before-all';
import { Job } from './job';

export class AfterAll extends AfterUnit {
  constructor(parent: Job, beforeAll: BeforeAll, fn: () => void | Promise<void>) {
    super(parent, beforeAll, 'afterAll', 'afterAll', fn);
  }
}
