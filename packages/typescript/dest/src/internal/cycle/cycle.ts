import { Printable, stringify } from '@dogu-tech/common';
import { color, colorTemplate } from '../colorizer';
import { Reporter } from '../reporter/reporter';
import { Exception } from './exception';
import { Tracker } from './tracker';
import { Job, JobChild } from './unit/job';
import { Unit } from './unit/unit';

export class Cycle {
  private tracker: Tracker;
  private current: JobChild | null = null;

  constructor(private readonly rootJob: Job, private readonly reporter: Reporter, private readonly printable: Printable) {
    this.tracker = new Tracker(this.rootJob, printable);
  }

  async start(timeout: number): Promise<void> {
    this.rootJob.build();
    await this.reporter.create([this.rootJob]);
    const timer = this.setTimeout(timeout);
    try {
      await this.run(this.rootJob, this.rootJob.name);
    } catch (error) {
      const cause = error instanceof Error ? error : new Error(stringify(error));
      throw new Error(`Dest internal error`, { cause });
    } finally {
      clearTimeout(timer);
    }
  }

  finish(): void {
    this.tracker.print();
    process.exit(this.rootJob.state === 'passed' ? 0 : 1);
  }

  private setTimeout(timeout: number): NodeJS.Timeout {
    return setTimeout(() => {
      if (!this.isDone) {
        (async (): Promise<void> => {
          await this.triggerTimeout(timeout);
        })().catch((error) => {
          this.printable.error('Dest internal timeout process error', { error });
          process.exit(1);
        });
      }
    }, timeout);
  }

  private async triggerTimeout(timeout: number): Promise<void> {
    if (!this.current) {
      return;
    }
    if (this.current instanceof Job) {
      await this.current.fail();
    } else if (this.current instanceof Unit) {
      await this.current.triggerTimeout('', `timeout ${timeout}ms`);
    }
    await this.timeoutCleanup();
    this.finish();
  }

  private async timeoutCleanup(): Promise<void> {
    if (!this.current) {
      return;
    }
    const scopePrefix = color.bgRedBright(`⏰ Timeout Cleanup`);
    let job: Job | null = null;
    if (this.current instanceof Job) {
      job = this.current;
    } else if (this.current instanceof Unit) {
      job = this.current.parent;
    }
    let scope = '';
    while (job) {
      scope = scope.length > 0 ? `${job.name} ⬅️  ${scope}` : job.name;
      if (this.current === job.allUnitFactory.after || !job.allUnitFactory.after) {
        job = job.parent;
        continue;
      }
      try {
        await this.runUnit(job.allUnitFactory.after, `${scopePrefix} ${colorTemplate.bgOrange(job.name)}`);
      } catch (error) {
        this.printable.error('Dest timeout cleanup processing error', { error });
      } finally {
        job = job.parent;
      }
    }
  }

  private async run(current: JobChild, scope: string): Promise<void> {
    if (current.isStateCompleted()) {
      return;
    }
    this.current = current;
    if (current instanceof Job) {
      await current.run();
      for (const child of current.children) {
        await this.run(child, scope.length === 0 ? child.name : `${scope} ➡️  ${child.name}`);
      }
    } else if (current instanceof Unit) {
      await this.runUnit(current, color.bgWhiteBright(color.blackBright(scope)));
    }
  }

  private async runUnit(unit: Unit, scope: string): Promise<void> {
    try {
      console.info(`${scope} ${color.bgWhiteBright(color.blackBright('started'))}`);
      await unit.run();
    } catch (error: unknown) {
      const e = error as Error;
      await unit.fail(new Exception(`${scope}`, e.message, e));
    } finally {
      console.info(`${scope} ${unit.stateColorized()}`);
    }
  }

  private get isDone(): boolean {
    return this.rootJob.state === 'passed' || this.rootJob.state === 'failed';
  }
}
