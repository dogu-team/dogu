import { Platform, Serial } from '@dogu-private/types';
import { delay, FilledPrintable, stringify } from '@dogu-tech/common';
import { killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import { env } from '../../../env';
import { Adb } from '../../externals/index';
import { Zombieable, ZombieProps, ZombieQueriable } from '../zombie/zombie-component';
import { ZombieServiceInstance } from '../zombie/zombie-service';

const UserId = 0;
const BlockAppList = [
  'com.skt.prod.dialer', // block galaxy dialer
  'com.samsung.android.dialer', // block galaxy dialer
  'com.samsung.android.app.telephonyui', // block galaxy emergency dialer
  'com.samsung.android.mobileservice', // block galaxy samsung login
  'com.google.android.gms/.update.SystemUpdateActivity', // block pixel system update, not tested
];
const StartActivityLogKeyword = `START u${UserId}`;

export class AndroidSharedDeviceService implements Zombieable {
  private logcatProc: child_process.ChildProcess | undefined = undefined;
  private zombieWaiter: ZombieQueriable;

  constructor(public serial: Serial, public printable: FilledPrintable) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
  }

  async wait(): Promise<void> {
    await this.zombieWaiter?.waitUntilAlive();
  }

  delete(): void {
    ZombieServiceInstance.deleteComponent(this);
  }

  get name(): string {
    return 'AndroidSharedDeviceService';
  }

  get platform(): Platform {
    return Platform.PLATFORM_ANDROID;
  }

  get props(): ZombieProps {
    return {
      serial: this.serial,
    };
  }

  async revive(): Promise<void> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
      return;
    }
    await Adb.stayOnWhilePluggedIn(this.serial);
    // for (const app of BlockAppList) {
    //   await Adb.disablePackage(this.serial, app, UserId, this.printable).catch((e) => {
    //     this.printable.error(`AndroidSharedDeviceService. revive. disablePackage failed.`, { e });
    //   });
    // }
    this.startLogcatProcess(this.serial, this.printable).catch((e) => {
      this.printable.error(e);
    });
  }

  async update(): Promise<void> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
      return;
    }
    const appInfos = await Adb.getForegroundPackage(this.serial);
    const filteredList = appInfos.filter((app) => app.displayId === 0 && BlockAppList.includes(app.packageName));
    for (const filtered of filteredList) {
      await Adb.killPackage(this.serial, filtered.packageName).catch((e) => {
        this.printable.error(`AndroidSharedDeviceService. update. killPackage failed.`, { e });
      });
    }
    await delay(3000);
  }

  onDie(): void | Promise<void> {
    this.killLogcatProcess();
  }

  private async startLogcatProcess(serial: Serial, logger: FilledPrintable): Promise<void> {
    const openTime = await Adb.getTime(serial);
    if (openTime) {
      const killPackageIfContains = (msg: string): void => {
        for (const app of BlockAppList) {
          if (msg.includes(app)) {
            Adb.killPackage(serial, app).catch((e) => {
              logger.error(e);
            });
          }
        }
      };
      this.logcatProc = Adb.logcat(
        serial,
        ['-e', StartActivityLogKeyword, '-T', `${openTime}`],
        {
          info: (msg) => killPackageIfContains(stringify(msg)),
          error: (msg) => killPackageIfContains(stringify(msg)),
        },
        logger,
      );
      this.logcatProc.on('close', (code, signal) => {
        logger.info(`logcat process closed.`, { code, signal });
        this.logcatProc = undefined;
        ZombieServiceInstance.notifyDie(this, 'logcat process closed');
      });
    }
  }

  private killLogcatProcess(): void {
    if (!this.logcatProc) {
      return;
    }
    killChildProcess(this.logcatProc).catch((e) => {
      console.error(e);
    });
    this.logcatProc = undefined;
  }
}
