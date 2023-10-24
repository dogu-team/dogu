import { Platform, Serial } from '@dogu-private/types';
import { errorify, loop, Printable, stringify } from '@dogu-tech/common';
import { logger } from '../../../logger/logger.instance';

export interface ZombieProps {
  [key: string]: unknown;
}

export interface Zombieable {
  get name(): string;
  get platform(): Platform;
  get serial(): Serial;
  get props(): ZombieProps;
  get printable(): Printable;
  // handle revive logic
  revive(): Promise<void>;
  // handle after revive
  afterRevive?(): Promise<void>;
  // handle update logic to do something periodically
  update?(): Promise<void>;
  // handle when zombie die. this is called when ZombieServiceInstance.notifyDie, and ZombieServiceInstance.deleteComponent called
  onDie(): Promise<void> | void;
  onComponentDeleted?(): Promise<void> | void;
}

export class ZombieComponent {
  private _reviveCount = 0;
  private _lastError?: Error;
  constructor(public readonly impl: Zombieable, private isAliveSelf = false) {}

  get reviveCount(): number {
    return this._reviveCount;
  }

  get lastError(): Error | undefined {
    return this._lastError;
  }

  async tryRevive(): Promise<void> {
    try {
      this._reviveCount++;
      await this.impl.revive();
      this.isAliveSelf = true;
      await this.impl.afterRevive?.();
    } catch (e: unknown) {
      this.impl.printable.error(`${this.impl.name}.revive failed  error:${stringify(e)}`);
      this._lastError = errorify(e);
      this.isAliveSelf = false;
    }
  }

  async onDie(dieReason = 'unknown'): Promise<void> {
    await this.impl.onDie();
    this.isAliveSelf = false;
    this._lastError = new Error(dieReason);
  }
  async onComponentDeleted(): Promise<void> {
    await this.impl.onComponentDeleted?.();
  }

  isAlive(): boolean {
    return this.isAliveSelf;
  }
}

const MaxWaitReviveCount = 5;

export class ZombieQueriable {
  constructor(private readonly zombieComponent: ZombieComponent) {}

  async waitUntilAlive(maxReviveCount = MaxWaitReviveCount): Promise<void> {
    const befReviveCount = this.zombieComponent.reviveCount;
    for await (const _ of loop(1000)) {
      if (this.zombieComponent.isAlive()) {
        return;
      }
      const diffReviveCount = this.zombieComponent.reviveCount - befReviveCount;
      if (diffReviveCount > maxReviveCount) {
        logger.error(`ZombieComponent ${this.zombieComponent.impl.name} waitUntilAlive failed`, { maxReviveCount, error: this.zombieComponent.lastError });
        throw this.zombieComponent.lastError ?? new Error('unknown');
      }
    }
  }

  isAlive(): boolean {
    return this.zombieComponent.isAlive();
  }
}
