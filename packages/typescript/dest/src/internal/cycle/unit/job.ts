import { stringify } from '@dogu-tech/common';
import { DestBubbleableState, DestPropagatableState, DestState } from '@dogu-tech/types';
import { NullReporterUnit, ReporterUnit, ReporterUnitHavable } from '../../reporter/unit';
import { JobStatistic } from '../../type';
import { UnitFactory } from '../unit-factory';
import { OnStateChangeable } from './types';
import { Unit } from './unit';

export type JobChild = Job | Unit;

export class Job implements ReporterUnitHavable, OnStateChangeable {
  allUnitFactory = new UnitFactory();
  eachUnitFactory = new UnitFactory();
  children: JobChild[] = [];
  state: DestState = 'pending';
  reporterUnit: ReporterUnit = new NullReporterUnit();

  private statistic: JobStatistic | undefined;

  constructor(readonly parent: Job | null, readonly name: string) {}

  build(): void {
    const children = this.children
      .map((child) => {
        if (child instanceof Unit) {
          const { before, after } = this.eachUnitFactory.clone();
          return [before, child, after];
        } else if (child instanceof Job) {
          child.build();
          return [child];
        } else {
          throw new Error(`Unexpected child type: ${stringify(child)}`);
        }
      })
      .flat();
    const { before, after } = this.allUnitFactory.clone();
    this.children = [before, ...children, after].filter((child) => child !== null) as JobChild[];
  }

  getStatistic(): JobStatistic {
    const search = (statistic: JobStatistic, children: JobChild[]): void => {
      for (const child of children) {
        if (child instanceof Job) {
          const stateKey = `${child.state}Job` as keyof JobStatistic;
          statistic[stateKey] = statistic[stateKey] + 1;
          statistic['totalJob'] = statistic['totalJob'] + 1;

          search(statistic, child.children);
          child.getStatistic();
        } else {
          const stateKey = `${child.state}Test` as keyof JobStatistic;
          statistic[stateKey] = statistic[stateKey] + 1;
          statistic['totalTest'] = statistic['totalTest'] + 1;
        }
      }
    };

    if (!this.statistic) {
      this.statistic = {
        totalJob: 0,
        totalTest: 0,
        failedTest: 0,
        passedTest: 0,
        skippedTest: 0,
        pendingTest: 0,
        failedJob: 0,
        passedJob: 0,
        skippedJob: 0,
        pendingJob: 0,
      };

      search(this.statistic, [this]);
    }

    return this.statistic;
  }

  async run(): Promise<void> {
    await this.setState('running');
  }

  async pass(): Promise<void> {
    await this.onStateBubbled('passed');
  }

  async fail(): Promise<void> {
    await this.onStateBubbled('failed');
  }

  private async setState(state: DestState): Promise<void> {
    this.state = state;
    await this.reporterUnit.updateState(state);
  }

  async onStatePropagated(state: DestPropagatableState): Promise<void> {
    if (state === 'skipped') {
      if (!this.isStateCompleted()) {
        await this.setState(state);
      }
      for (const child of this.children) {
        await child.onStatePropagated(state);
      }
    } else {
      throw new Error(`Unexpected capture state: ${stringify(state)}`);
    }
  }

  async onStateBubbled(state: DestBubbleableState): Promise<void> {
    if (state === 'passed') {
      if (this.children.every((child) => child.state === 'passed')) {
        await this.setState(state);
        await this.parent?.onStateBubbled(state);
      }
    } else if (state === 'failed') {
      await this.setState(state);
      await this.onStatePropagated('skipped');
      await this.parent?.onStateBubbled(state);
    } else {
      throw new Error(`Unexpected bubble state: ${stringify(state)}`);
    }
  }

  isStateCompleted(): boolean {
    return this.state === 'passed' || this.state === 'failed' || this.state === 'skipped';
  }
}
