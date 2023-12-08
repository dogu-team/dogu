import { DuplicatedCallGuarder, stringify } from '@dogu-tech/common';
import { zombieLogger } from '../../../logger/logger.instance';
import { Zombieable, ZombieComponent, ZombieQueriable } from './zombie-component';
import { makeLogs } from './zombie-log';

export interface ZombieChecker {
  component: ZombieComponent;
  updateGuard: DuplicatedCallGuarder;
  check: () => Promise<void>;
  isReviving: boolean;
  reviveCount: number;
  isUpdating: boolean;
  updateCount: number;
}

export class ZombieService {
  constructor(
    private checkers: ZombieChecker[] = [],
    private befTime = 0,
  ) {}

  update(): void {
    for (const checker of this.checkers) {
      checker.check().catch((e: Error) => {
        zombieLogger.error(`ZombieService.update ${checker.component.impl.name} check failed  error:${stringify(e)}`);
      });
    }

    if (Date.now() - this.befTime < 6000) {
      return;
    }
    this.befTime = Date.now();
    if (0 < this.checkers.length) {
      zombieLogger.info(makeLogs(this.checkers));
    }
  }

  addComponent(zombieable: Zombieable): ZombieQueriable {
    const ret: ZombieChecker = {
      component: new ZombieComponent(zombieable),
      updateGuard: new DuplicatedCallGuarder(),
      check: async (): Promise<void> => {
        await ret.updateGuard.guard(async () => {
          if (ret.component.isAlive()) {
            if (ret.component.impl.update) {
              ret.isUpdating = true;
              ret.updateCount++;
              await Promise.resolve(ret.component.impl.update?.())
                .catch((e: Error) => {
                  zombieLogger.error(`ZombieComponent update failed `, {
                    name: ret.component.impl.name,
                    serial: ret.component.impl.serial,
                    error: stringify(e, { compact: true }),
                  });
                })
                .finally(() => {
                  ret.isUpdating = false;
                });
            }
            return;
          }

          ret.isReviving = true;
          await ret.component
            .tryRevive()
            .catch((e: Error) => {
              zombieLogger.error(`ZombieComponent revive failed `, { name: ret.component.impl.name, serial: ret.component.impl.serial, error: stringify(e, { compact: true }) });
            })
            .finally(() => {
              ret.isReviving = false;
              ret.reviveCount = ret.component.reviveCount;
            });
        });
      },
      isReviving: false,
      reviveCount: 0,
      isUpdating: false,
      updateCount: 0,
    };
    this.checkers.push(ret);
    zombieLogger.info(`ZombieService.addComponent done`, { name: ret.component.impl.name, serial: ret.component.impl.serial });
    return new ZombieQueriable(ret.component);
  }

  // notify die of some zombie. zombie will be revived after a while
  notifyDie(zombie: Zombieable, closeReason?: string): void {
    const target = this.checkers.find((checker) => checker.component.impl === zombie);
    if (target == null) {
      return;
    }
    zombieLogger.info(`ZombieService.notifyDie`, {
      name: target.component.impl.name,
      serial: target.component.impl.serial,
      isAlive: target.component.isAlive(),
      reason: closeReason,
    });
    if (target.component.isAlive()) {
      target.component.onDie(closeReason).catch((e: Error) => {
        zombieLogger.error(`ZombieComponent ${target.component.impl.name} onDie failed error:${stringify(e, { compact: true })}`);
      });
    }
  }
  isAlive(zombie: Zombieable): boolean {
    const target = this.checkers.find((checker) => checker.component.impl === zombie);
    if (target == null) {
      return false;
    }
    return target.component.isAlive();
  }

  // permanently delete zombie component. zombie will not be revived
  deleteComponent(zombie: Zombieable, closeReason?: string): void {
    this.deleteComponentIfExist((z) => z === zombie, closeReason);
  }
  deleteAllComponentsIfExist(comparer: (zombieable: Zombieable) => boolean, closeReason?: string): void {
    for (let index = 0; index < 100; index++) {
      const ret = this.deleteComponentIfExist(comparer, closeReason);
      if (!ret) {
        break;
      }
    }
  }

  deleteComponentIfExist(comparer: (zombieable: Zombieable) => boolean, closeReason?: string): boolean {
    const target = this.checkers.find((checker) => comparer(checker.component.impl));
    if (target == null) {
      return false;
    }
    target.component.onDie(closeReason).catch((e: Error) => {
      zombieLogger.error(`ZombieService onDie failed`, { name: target.component.impl.name, serial: target.component.impl.serial, error: stringify(e, { compact: true }) });
    });
    target.component.onComponentDeleted().catch((e: Error) => {
      zombieLogger.error(`ZombieService onComponentDeleted failed`, {
        name: target.component.impl.name,
        serial: target.component.impl.serial,
        error: stringify(e, { compact: true }),
      });
    });

    const index = this.checkers.indexOf(target);
    if (index === -1) {
      return false;
    }
    this.checkers.splice(index, 1);
    zombieLogger.info(`ZombieService.deleteComponent done`, { name: target.component.impl.name, serial: target.component.impl.serial });
    return true;
  }
}

export const ZombieServiceInstance = new ZombieService();
const onUpdateGuarder = new DuplicatedCallGuarder();
setInterval(() => {
  onUpdateGuarder
    .guard(() => {
      ZombieServiceInstance.update();
    })
    .catch((e: Error) => {
      console.error(e);
      process.exit(1);
    });
}, 1000);
