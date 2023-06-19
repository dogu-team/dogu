import { DuplicatedCallGuarder, stringify } from '@dogu-tech/common';
import { logger } from '../../../logger/logger.instance';
import { Zombieable, ZombieComponent, ZombieWaiter } from './zombie-component';
import { makeLogs } from './zombie-log';

export interface ZombieChecker {
  zombie: ZombieComponent;
  updateGuard: DuplicatedCallGuarder;
  check: () => Promise<void>;
  isReviving: boolean;
  reviveCount: number;
  isUpdating: boolean;
  updateCount: number;
}

export class ZombieService {
  constructor(private checkers: ZombieChecker[] = [], private befTime = 0) {}

  update(): void {
    for (const checker of this.checkers) {
      checker.check().catch((e: Error) => {
        logger.error(`ZombieService.update ${checker.zombie.zombieable.name} check failed  error:${stringify(e)}`);
      });
    }

    if (Date.now() - this.befTime < 6000) {
      return;
    }
    this.befTime = Date.now();
    if (0 < this.checkers.length) {
      logger.verbose(makeLogs(this.checkers));
    }
  }

  addComponent(zombieable: Zombieable): ZombieWaiter {
    const ret: ZombieChecker = {
      zombie: new ZombieComponent(zombieable),
      updateGuard: new DuplicatedCallGuarder(),
      check: async (): Promise<void> => {
        await ret.updateGuard.guard(async () => {
          // if (!(await ret.zombie.shouldReviveRecursive())) {
          //   const index = this.checkers.indexOf(ret);
          //   if (index === -1) {
          //     return;
          //   }
          //   this.checkers.splice(index, 1);
          //   return;
          // }
          if (ret.zombie.isAlive()) {
            if (ret.zombie.zombieable.update) {
              ret.isUpdating = true;
              ret.updateCount++;
              await Promise.resolve(ret.zombie.zombieable.update?.())
                .catch((e: Error) => {
                  logger.error(`ZombieComponent ${ret.zombie.zombieable.name} update failed error:${stringify(e, { compact: true })}`);
                })
                .finally(() => {
                  ret.isUpdating = false;
                });
            }
            return;
          }

          ret.isReviving = true;
          ret.reviveCount++;
          await ret.zombie
            .tryRevive()
            .catch((e: Error) => {
              logger.error(`ZombieComponent ${ret.zombie.zombieable.name} reviveCheck failed error:${stringify(e, { compact: true })}`);
            })
            .finally(() => {
              ret.isReviving = false;
            });
        });
      },
      isReviving: false,
      reviveCount: 0,
      isUpdating: false,
      updateCount: 0,
    };
    this.checkers.push(ret);
    return new ZombieWaiter(ret.zombie);
  }

  // notify die of some zombie. zombie will be revived after a while
  notifyDie(zombie: Zombieable, closeReason?: string): void {
    const target = this.checkers.find((checker) => checker.zombie.zombieable === zombie);
    if (target == null) {
      return;
    }
    target.zombie.onDie(closeReason);
  }

  // permanently delete zombie component. zombie will not be revived
  deleteComponent(zombie: Zombieable, closeReason?: string): void {
    const target = this.checkers.find((checker) => checker.zombie.zombieable === zombie);
    if (target == null) {
      return;
    }
    target.zombie.onDie(closeReason);

    const index = this.checkers.indexOf(target);
    if (index === -1) {
      return;
    }
    this.checkers.splice(index, 1);
    return;
  }

  deleteComponentIfExist(comparer: (zombieable: Zombieable) => boolean, closeReason?: string): void {
    const target = this.checkers.find((checker) => comparer(checker.zombie.zombieable));
    if (target == null) {
      return;
    }
    target.zombie.onDie(closeReason);

    const index = this.checkers.indexOf(target);
    if (index === -1) {
      return;
    }
    this.checkers.splice(index, 1);
    return;
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
