import { Platform, Serial } from '@dogu-private/types';
import { loop, Printable, PromiseOrValue, stringify } from '@dogu-tech/common';

export interface ZombieProps {
  [key: string]: unknown;
}

export interface Zombieable {
  get parent(): Zombieable | null;
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
}

export class ZombieComponent {
  constructor(public readonly zombieable: Zombieable, private isAliveSelf = false, private dieReason = '') {}

  async tryRevive(): Promise<void> {
    try {
      await this.zombieable.revive();
      this.isAliveSelf = true;
      await this.zombieable.afterRevive?.();
    } catch (e: unknown) {
      this.zombieable.printable.error(`${this.zombieable.name}.reviveCheck failed  error:${stringify(e)}`);
      this.dieReason = `reviveCheck failed error:${stringify(e)}`;
      this.isAliveSelf = false;
    }
  }

  async onDie(dieReason = 'unknown'): Promise<void> {
    await this.zombieable.onDie();
    this.isAliveSelf = false;
    this.dieReason = dieReason;
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

  // async shouldReviveRecursive(): Promise<boolean> {
  //   let parent = this.zombieable;
  //   while (parent != null) {
  //     if (!(await parent.shouldRevive())) {
  //       return false;
  //     }
  //     if (parent.parent == null) {
  //       return true;
  //     }
  //     parent = parent.parent;
  //   }
  //   return true;
  // }
}

export class ZombieWaiter {
  constructor(private readonly zombieComponent: ZombieComponent) {}

  async waitUntilAlive(): Promise<void> {
    for await (const _ of loop(1000)) {
      if (this.zombieComponent.isAlive()) {
        return;
      }
    }
  }
}
