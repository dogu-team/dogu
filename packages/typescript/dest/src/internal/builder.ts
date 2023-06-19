import { PromiseOrValue } from '@dogu-tech/common';
import { AfterAll } from './cycle/unit/after-all';
import { AfterEach } from './cycle/unit/after-each';
import { BeforeAll } from './cycle/unit/before-all';
import { BeforeEach } from './cycle/unit/before-each';
import { Job } from './cycle/unit/job';
import { Test } from './cycle/unit/test';
import { Runner } from './runner';

export class Builder {
  private rootJob: Job | null = null;
  private currentJob: Job | null = null;

  job(name: string, fn: () => PromiseOrValue<void>): void {
    let previousJob = this.currentJob;
    const newJob = new Job(this.currentJob, name);
    if (!this.currentJob) {
      this.rootJob = newJob;
    } else {
      this.currentJob.children.push(newJob);
    }
    this.currentJob = newJob;
    fn();
    this.currentJob = previousJob;
  }

  test(name: string, fn: () => PromiseOrValue<void>): void {
    const currentJob = this.parse('test');
    const test = new Test(currentJob, name, fn);
    currentJob.children.push(test);
  }

  beforeAll(fn: () => PromiseOrValue<void>): void {
    const currentJob = this.parse('beforeAll');
    if (currentJob.allUnitFactory.before) {
      throw new Error('beforeAll already exists');
    }
    currentJob.allUnitFactory.before = new BeforeAll(currentJob, fn);
  }

  afterAll(fn: () => PromiseOrValue<void>): void {
    const currentJob = this.parse('afterAll');
    if (!currentJob.allUnitFactory.before) {
      throw new Error('afterAll must be placed after beforeAll');
    }
    if (currentJob.allUnitFactory.after) {
      throw new Error('afterAll already exists');
    }
    currentJob.allUnitFactory.after = new AfterAll(currentJob, currentJob.allUnitFactory.before, fn);
  }

  beforeEach(fn: () => PromiseOrValue<void>): void {
    const currentJob = this.parse('beforeEach');
    if (currentJob.eachUnitFactory.before) {
      throw new Error('beforeEach already exists');
    }
    currentJob.eachUnitFactory.before = new BeforeEach(currentJob, fn);
  }

  afterEach(fn: () => PromiseOrValue<void>): void {
    const currentJob = this.parse('afterEach');
    if (!currentJob.eachUnitFactory.before) {
      throw new Error('afterEach must be placed after beforeEach');
    }
    if (currentJob.eachUnitFactory.after) {
      throw new Error('afterEach already exists');
    }
    currentJob.eachUnitFactory.after = new AfterEach(currentJob, currentJob.eachUnitFactory.before, fn);
  }

  build(): Job {
    const job = this.rootJob;
    if (!job) {
      throw new Error('Did you call job() and test()?');
    }
    this.rootJob = null;
    this.currentJob = null;
    return job;
  }

  private parse(type: string): Job {
    if (Runner.instance.isRunning) {
      throw new Error(`Cannot add a ${type} while the test run is in progress`);
    }
    if (this.currentJob === null) {
      throw new Error(`Did you place ${type}() inside job()?`);
    }
    return this.currentJob;
  }

  static instance = new Builder();
}
