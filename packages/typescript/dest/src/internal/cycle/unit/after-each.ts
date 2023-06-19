import { AfterUnit } from './after-unit';
import { BeforeEach } from './before-each';
import { Job } from './job';

export class AfterEach extends AfterUnit {
  constructor(parent: Job, beforeEach: BeforeEach, fn: () => void | Promise<void>) {
    super(parent, beforeEach, 'afterEach', 'afterEach', fn);
  }
}
