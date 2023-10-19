import { Platform, PrivateProtocol, Serial } from '@dogu-private/types';
import { delay, FilledPrintable, loop, stringify } from '@dogu-tech/common';
import { HostPaths, killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import fs from 'fs';
import { env } from '../../../env';
import { Adb, AndroidPropInfo, AppiumAdb } from '../../externals/index';
import { AndroidResetService } from '../reset/android-reset';
import { Zombieable, ZombieProps, ZombieQueriable } from '../zombie/zombie-component';
import { ZombieServiceInstance } from '../zombie/zombie-service';

type DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;
const DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;

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

interface PreinstallAppInfo {
  packageName: string;
  filePath: () => string;
}

const GboardAppInfo: PreinstallAppInfo = {
  packageName: 'com.google.android.inputmethod.latin',
  filePath: () => HostPaths.external.preInstall.gboard.apk(),
};
const PreinstallApps: PreinstallAppInfo[] = [GboardAppInfo];

export class AndroidSharedDeviceService implements Zombieable {
  private logcatProc: child_process.ChildProcess | undefined = undefined;
  private zombieWaiter: ZombieQueriable;
  private state: string = 'none';
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
      state: this.state,
    };
  }

  async revive(): Promise<void> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
      return;
    }
    this.state = 'reviving';
    if (!this.isSetupDone) {
      this.state = 'resetting';
      await AndroidResetService.resetBeforeConnected(this.serial, this.printable);
      this.state = 'preinstalling';
      await this.preInstallApps();
      await this.setGboardAsDefaultKeyboard();
      await this.mute();
      this.state = 'changing-locale';
      await this.appiumAdb.setDeviceLocale('en-US');
      this.isSetupDone = true;
      this.state = 'setup-done';
    }
    await Adb.stayOnWhilePluggedIn(this.serial);
    this.startLogcatProcess(this.serial, this.printable).catch((e) => {
      this.printable.error(e);
    });
    this.state = 'alive';
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
    this.state = 'dead';
    this.killLogcatProcess();
  }

  /*
   *block
   */

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

  /*
   * PreInstall
   */

  private async preInstallApps(): Promise<void> {
    for (const app of PreinstallApps) {
      await Adb.uninstallApp(this.serial, app.packageName, false, this.printable).catch((e) => {
        this.printable.error(`AndroidSharedDeviceService.preInstallApps. uninstallApp failed.`, { e });
      });
      if (!fs.existsSync(app.filePath())) {
        this.printable.warn(`AndroidSharedDeviceService.preInstallApps. file not exists.`, { app });
        continue;
      }
      await Adb.installApp(this.serial, app.filePath(), this.printable);
    }
  }

  private async setGboardAsDefaultKeyboard(): Promise<void> {
    for await (const _ of loop(1000, 10)) {
      const filteredPackages = (await Adb.getIntalledPackages(this.serial)).filter((pkg) => pkg.packageName.includes(GboardAppInfo.packageName));
      if (0 < filteredPackages.length) {
        break;
      }
    }
    const filteredPackages = (await Adb.getIntalledPackages(this.serial)).filter((pkg) => pkg.packageName.includes(GboardAppInfo.packageName));
    if (0 === filteredPackages.length) {
      this.printable.warn(`AndroidSharedDeviceService.setGboardAsDefaultKeyboard. gboard is not installed.`, { filteredPackages });
      return;
    }
    for await (const _ of loop(1000, 10)) {
      const targetIme = (await Adb.getIMEList(this.serial)).find((ime) => ime.packageName.includes(GboardAppInfo.packageName));
      if (targetIme) {
        break;
      }
    }
    const targetIme = (await Adb.getIMEList(this.serial)).find((ime) => ime.packageName.includes(GboardAppInfo.packageName));
    if (!targetIme) {
      this.printable.warn(`AndroidSharedDeviceService.setGboardAsDefaultKeyboard. gboard is not in ime.`, { targetIme });
      return;
    }

    const imeId = `${targetIme.packageName}/${targetIme.service}`;
    await this.appiumAdb.enableIME(imeId);
    await this.appiumAdb.setIME(imeId);
  }

  private async mute(): Promise<void> {
    for await (const _ of loop(100, 20)) {
      await Adb.keyevent(this.serial, DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_DOWN);
    }
    await Adb.keyevent(this.serial, DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MUTE);
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
