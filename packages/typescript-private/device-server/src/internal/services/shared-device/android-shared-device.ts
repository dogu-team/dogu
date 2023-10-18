import { Platform, Serial } from '@dogu-private/types';
import { delay, FilledPrintable, stringify } from '@dogu-tech/common';
import { killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import { env } from '../../../env';
import { Adb, AndroidPropInfo, AppiumAdb } from '../../externals/index';
import { AndroidResetService } from '../reset/android-reset';
import { Zombieable, ZombieProps, ZombieQueriable } from '../zombie/zombie-component';
import { ZombieServiceInstance } from '../zombie/zombie-service';

const UserId = 0;

interface BlockAppInfo {
  isBlockOnTestHarness: boolean;
  keyword: string;
  packageName: string;
}
const BlockAppList: BlockAppInfo[] = [
  {
    isBlockOnTestHarness: true,
    keyword: 'com.skt.prod.dialer', // block galaxy dialer
    packageName: 'com.skt.prod.dialer',
  },
  {
    isBlockOnTestHarness: true,
    keyword: 'com.samsung.android.dialer', // block galaxy dialer
    packageName: 'com.samsung.android.dialer',
  },
  {
    isBlockOnTestHarness: true,
    keyword: 'com.samsung.android.app.telephonyui', // block galaxy emergency dialer
    packageName: 'com.samsung.android.app.telephonyui',
  },
  {
    isBlockOnTestHarness: false,
    keyword: 'com.samsung.android.mobileservice', // block galaxy samsung login
    packageName: 'com.samsung.android.mobileservice',
  },
  {
    isBlockOnTestHarness: true,
    keyword: 'com.google.android.gms/.update.SystemUpdateActivity', // block pixel system update, not tested
    packageName: 'com.google.android.gms',
  },
];
const StartActivityLogKeyword = `START u${UserId}`;

export class AndroidSharedDeviceService implements Zombieable {
  private logcatProc: child_process.ChildProcess | undefined = undefined;
  private zombieWaiter: ZombieQueriable;
  private isSetupDone = false;

  constructor(public serial: Serial, private appiumAdb: AppiumAdb, public androidProps: AndroidPropInfo, public printable: FilledPrintable) {
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
    if (!this.isSetupDone) {
      if (this.androidProps.persist_sys_test_harness === '1') {
        // noop
      } else {
        await AndroidResetService.resetBeforeConnected(this.serial, this.printable);
        await this.appiumAdb.setDeviceLocale('ko-KR');
        await this.appiumAdb.setDeviceLocale('en-US');
      }
      this.isSetupDone = true;
    }
    await Adb.stayOnWhilePluggedIn(this.serial);
    this.startLogcatProcess(this.serial, this.printable).catch((e) => {
      this.printable.error(e);
    });
  }

  async update(): Promise<void> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
      return;
    }
    const appInfos = await Adb.getForegroundPackage(this.serial);
    const filteredList = appInfos.filter((app) => app.displayId === 0 && 0 < this.filterMsgThatContainsBlockApp(app.packageName).length);
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
        const filtered = this.filterMsgThatContainsBlockApp(msg);
        for (const app of filtered) {
          Adb.killPackage(serial, app.packageName).catch((e) => {
            logger.error(e);
          });
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

  private filterMsgThatContainsBlockApp(msg: string): BlockAppInfo[] {
    const ret: BlockAppInfo[] = [];
    for (const app of BlockAppList) {
      if (msg.includes(app.keyword)) {
        if (app.isBlockOnTestHarness && this.androidProps.persist_sys_test_harness === '1') {
          continue;
        }
        ret.push(app);
      }
    }
    return ret;
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
