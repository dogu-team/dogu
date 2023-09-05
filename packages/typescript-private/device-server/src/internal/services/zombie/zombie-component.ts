import { Platform, Serial } from '@dogu-private/types';
import { loop, Printable, stringify } from '@dogu-tech/common';

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
  constructor(public readonly impl: Zombieable, private isAliveSelf = false, private dieReason = '') {}

  async tryRevive(): Promise<void> {
    try {
      await this.impl.revive();
      this.isAliveSelf = true;
      await this.impl.afterRevive?.();
    } catch (e: unknown) {
      this.impl.printable.error(`${this.impl.name}.reviveCheck failed  error:${stringify(e)}`);
      this.dieReason = `reviveCheck failed error:${stringify(e)}`;
      this.isAliveSelf = false;
    }
  }

  async onDie(dieReason = 'unknown'): Promise<void> {
    await this.impl.onDie();
    this.isAliveSelf = false;
    this.dieReason = dieReason;
  }
  async onComponentDeleted(): Promise<void> {
    await this.impl.onComponentDeleted?.();
  }

  isAlive(): boolean {
    return this.isAliveSelf;
  }

  async waitUntilAlive(): Promise<void> {
    for await (const _ of loop(1000)) {
      if (this.isAlive()) {
        return;
      }
    }
  }
}

export class ZombieQueriable {
  constructor(private readonly zombieComponent: ZombieComponent) {}

  async waitUntilAlive(): Promise<void> {
    for await (const _ of loop(1000)) {
      if (this.zombieComponent.isAlive()) {
        return;
      }
    }
  }

  isAlive(): boolean {
    return this.zombieComponent.isAlive();
  }
}
