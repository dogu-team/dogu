import { NullLogger, Printable, PromiseOrValue, stringify } from '@dogu-tech/common';
import { DestBubbleableState, DestPropagatableState, DestState } from '@dogu-tech/types';
import lodash from 'lodash';
import { color, colorTemplate } from '../../colorizer';
import { NullReporterUnit, ReporterUnit, ReporterUnitHavable } from '../../reporter/unit';
import { Exception } from '../exception';
import { Job } from './job';
import { Cloneable, OnStateChangeable } from './types';

export type UnitType = 'test' | 'beforeAll' | 'beforeEach' | 'afterAll' | 'afterEach';

export type UnitCallHandler = () => PromiseOrValue<void>;

export abstract class Unit implements ReporterUnitHavable, OnStateChangeable, Cloneable {
  readonly parent: Job;
  readonly name: string;
  readonly type: UnitType;
  state: DestState = 'pending';
  exception: Exception | null = null;
  readonly timer = { startAt: 0, finishAt: 0, elapsedSeconds: 0 };
  reporterUnit: ReporterUnit = new NullReporterUnit();
  printable: Printable = NullLogger.instance;

  private readonly fn: UnitCallHandler;

  constructor(parent: Job, name: string, type: UnitType, fn: UnitCallHandler) {
    this.parent = parent;
    this.name = name;
    this.type = type;
    this.fn = fn;
  }

  async run(): Promise<void> {
    this.timer.startAt = Date.now();
    await this.setState('running');
    await this.fn();
    await this.pass();
  }

  async pass(): Promise<void> {
    this.setElapsedSeconds();
    await this.onStateBubbled('passed');
  }

  async fail(exception: Exception): Promise<void> {
    this.exception = exception;
    this.setElapsedSeconds();
    await this.onStateBubbled('failed');
  }

  stateColorized(): string {
    switch (this.state) {
      case 'passed':
        return color.bgGreen(this.state);
      case 'failed':
        return color.bgRed(this.state);
      case 'skipped':
        return color.bgYellow(this.state);
      case 'pending':
        return colorTemplate.bgOrange(this.state);
      case 'running':
        return color.bgBlueBright(this.state);
      default:
        return color.bgWhite(this.state);
    }
  }

  async triggerTimeout(parentScope: string, reason: string): Promise<void> {
    const scope = parentScope.length === 0 ? `${this.name}` : `${parentScope} › ${this.name}`;
    const exception = new Exception(scope, reason, undefined);
    await this.fail(exception);
  }

  private setElapsedSeconds(): void {
    this.timer.finishAt = Date.now();
    const seconds = (this.timer.finishAt - this.timer.startAt) / 1000;
    this.timer.elapsedSeconds = seconds;
  }

  protected async setState(state: DestState): Promise<void> {
    if (this.state !== 'pending' && this.state !== 'running') {
      this.printable.warn?.(`the state of "${this.name}" is not penidng or running but changed from ${this.state} to ${state}`);
    }
    this.printable.verbose?.(`${this.name} ${this.state} -> ${state}`);
    this.state = state;
    await this.reporterUnit.updateState(state);
  }

  async onStatePropagated(state: DestPropagatableState): Promise<void> {
    if (state === 'skipped') {
      if (!this.isStateCompleted()) {
        await this.setState(state);
      }
    } else {
      throw new Error(`Unexpected capture state: ${stringify(state)}`);
    }
  }

  async onStateBubbled(state: DestBubbleableState): Promise<void> {
    await this.setState(state);
    await this.parent.onStateBubbled(state);
  }

  isStateCompleted(): boolean {
    return this.state === 'passed' || this.state === 'failed' || this.state === 'skipped';
  }

  clone(): this {
    return lodash.clone(this);
  }
}
