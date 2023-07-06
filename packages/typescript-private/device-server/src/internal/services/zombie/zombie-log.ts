import { Platform } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { ZombieChecker } from './zombie-service';

export class ZombieLog {
  constructor(public readonly str: string, public childs: ZombieLog[] = []) {}

  toString(depth: number): string {
    const prefix = `${' '.repeat(depth)}${0 < depth ? '└' : ''}`;
    if (this.childs.length === 0) {
      return prefix + this.str;
    }
    const childStr = this.childs.map((child) => `${child.toString(depth + 1)}`).join('\n');
    return prefix + this.str + '\n' + childStr;
  }
}

export function makeLogs(checkers: ZombieChecker[]): string {
  const zombieLogs: ZombieLog[] = [];
  const toPlatformShortName = (platform: Platform): string => {
    return Platform[platform].replace('PLATFORM_', '');
  };
  for (const checker of checkers) {
    const platform = checker.component.impl.platform;
    let platformZombieLog = zombieLogs.find((zombieLog) => zombieLog.str === toPlatformShortName(platform));
    if (!platformZombieLog) {
      platformZombieLog = new ZombieLog(toPlatformShortName(platform));
      zombieLogs.push(platformZombieLog);
    }

    let serial = checker.component.impl.serial;
    if (0 === serial.length) {
      serial = 'common';
    }

    let platformZombieSerialLog = platformZombieLog.childs.find((zombieLog) => zombieLog.str === serial);
    if (!platformZombieSerialLog) {
      platformZombieSerialLog = new ZombieLog(serial);
      platformZombieLog.childs.push(platformZombieSerialLog);
    }
    const commonProp = [
      `OK:${checker.component.isAlive() ? '✅' : '❌'}`,
      ` / Revive:${checker.isReviving ? '🔄' : '-'} ${checker.reviveCount}`,
      ` / Update:${checker.isUpdating ? '🔄' : '-'} ${checker.updateCount}`,
    ];
    const propDict = {
      ...checker.component.impl.props,
    };
    let logs = ` ${checker.component.impl.name} [${commonProp}]` + ` ${stringify(propDict, { compact: true, breakLength: 1000 })}`;
    platformZombieSerialLog.childs.push(new ZombieLog(logs));
  }

  let logs = 'ZombieService.log\n';
  logs += zombieLogs.map((zombieLog) => zombieLog.toString(0)).join('\n');
  return logs;
}
