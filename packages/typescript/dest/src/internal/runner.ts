import { Printable } from '@dogu-tech/common';
import { FilledDestOptions } from '../options';
import { Builder } from './builder';
import { Cycle } from './cycle/cycle';
import { Job, JobChild } from './cycle/unit/job';
import { Unit } from './cycle/unit/unit';
import { ReporterFactory } from './reporter/factory';

export class Runner {
  private cycle: Cycle | null = null;

  get isRunning(): boolean {
    return !!this.cycle;
  }

  async run(printable: Printable, options: FilledDestOptions): Promise<void> {
    const rootJob = this.parse();
    this.updateLogger(rootJob, printable);
    const { timeout } = options;
    const reporter = await new ReporterFactory(printable).create();
    this.cycle = new Cycle(rootJob, reporter, printable);
    await this.cycle.start(timeout);
    this.cycle.finish();
    this.cycle = null;
  }

  parse(): Job {
    const rootJob = Builder.instance.build();
    if (!rootJob) {
      throw new Error('Did you call job() and test()?');
    }
    function exploreTest(job: Job): boolean {
      for (const child of job.children) {
        if (child instanceof Unit) {
          return true;
        } else if (child instanceof Job) {
          return exploreTest(child);
        }
      }
      return false;
    }
    if (!exploreTest(rootJob)) {
      throw new Error('Did you call test() at least once in your job()?');
    }
    return rootJob;
  }

  updateLogger(jobChild: JobChild, printable: Printable): void {
    if (jobChild instanceof Unit) {
      jobChild.printable = printable;
    } else if (jobChild instanceof Job) {
      jobChild.children.forEach((child) => this.updateLogger(child, printable));
    }
  }

  static instance = new Runner();
}
