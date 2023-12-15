import { DeviceSystemInfo, Platform, PrivateProtocol, Serial, SerialPrintable } from '@dogu-private/types';
import { delay, errorify, FilledPrintable, loop, stringify } from '@dogu-tech/common';
import { CheckTimer, HostPaths, killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import fs from 'fs';
import { AppiumContextImpl } from '../../../appium/appium.context';
import { env } from '../../../env';
import { AndroidChannel } from '../../channel/android-channel';
import { AdbSerial, AndroidPropInfo, AppiumAdb, isHarnessEnabled } from '../../externals/index';
import { AndroidWebDriver } from '../../externals/webdriver/android-webdriver';
import { AndroidDeviceAgentService } from '../device-agent/android-device-agent-service';
import { AndroidResetService } from '../reset/android-reset';
import { Zombieable, ZombieProps, ZombieQueriable } from '../zombie/zombie-component';
import { ZombieServiceInstance } from '../zombie/zombie-service';

type DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;
const DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;
type DeviceControlType = PrivateProtocol.DeviceControlType;
const DeviceControlType = PrivateProtocol.DeviceControlType;
type DeviceControlAction = PrivateProtocol.DeviceControlAction;
const DeviceControlAction = PrivateProtocol.DeviceControlAction;
type DeviceControlMetaState = PrivateProtocol.DeviceControlMetaState;
const DeviceControlMetaState = PrivateProtocol.DeviceControlMetaState;

const UserId = 0;

/*
 * BlockApps
 * disable: Disable package that starts with app.keyword
 * runtime: Filter logcat messages with "START u0" and If message contains app.keyword, kill app.packageName
 */
interface BlockAppInfo {
  vender: 'samsung' | 'lg' | 'kt' | 'skt' | 'google' | 'unknown';
  category: 'dial' | 'update' | 'noise' | 'account' | 'scam';
  keyword: string;
  packageName: string;
  skipOnTestHarness?: true;
  prefix?: string;
  disable?: true;
  runtime?: true;
}
const BlockAppList: BlockAppInfo[] = [
  /*
   *  Block dial
   */
  {
    vender: 'skt',
    category: 'dial',
    keyword: 'com.skt.prod.dialer', // block galaxy dialer
    packageName: 'com.skt.prod.dialer',
    runtime: true,
  },
  {
    vender: 'samsung',
    category: 'dial',
    keyword: 'com.samsung.android.dialer', // block galaxy dialer
    packageName: 'com.samsung.android.dialer',
    runtime: true,
  },
  {
    vender: 'samsung',
    category: 'dial',
    keyword: 'com.samsung.android.app.telephonyui', // block galaxy emergency dialer
    packageName: 'com.samsung.android.app.telephonyui',
    runtime: true,
  },
  {
    vender: 'samsung',
    category: 'dial',
    keyword: 'com.samsung.android.messaging', // block emergency alert
    packageName: 'com.samsung.android.messaging',
    disable: true,
    runtime: true,
  },
  /*
   * Block account
   */
  {
    vender: 'samsung',
    category: 'account',
    skipOnTestHarness: true,
    keyword: 'com.samsung.android.mobileservice', // block galaxy samsung login
    packageName: 'com.samsung.android.mobileservice',
    runtime: true,
  },
  {
    vender: 'samsung',
    category: 'account',
    skipOnTestHarness: true,
    keyword: 'com.osp.app.signin', // block galaxy samsung login
    packageName: 'com.osp.app.signin',
    runtime: true,
  },
  /*
   * Block updates
   */
  {
    vender: 'samsung',
    category: 'update',
    keyword: 'com.sec.android.soagent', // block galaxy software update
    packageName: 'com.sec.android.soagent',
    disable: true,
    runtime: true,
  },
  {
    vender: 'samsung',
    category: 'update',
    keyword: 'com.wssyncmldm', // block galaxy software update
    packageName: 'com.wssyncmldm',
    disable: true,
    runtime: true,
  },
  {
    vender: 'google',
    category: 'update',
    keyword: 'com.google.android.gms/.update.SystemUpdateActivity', // block pixel system update, not tested
    packageName: 'com.google.android.gms',
    runtime: true,
  },
  {
    vender: 'google',
    category: 'update',
    keyword: 'com.google.android.gms/.update.SystemUpdateActivity', // block pixel system update, not tested
    packageName: 'com.google.android.gms',
    runtime: true,
  },

  /*
   * Block noise apps
   */
  {
    vender: 'lg',
    category: 'noise',
    keyword: 'com.lguplus.',
    packageName: 'com.lguplus.',
    disable: true,
  },
  {
    vender: 'skt',
    category: 'noise',
    keyword: 'com.skt.',
    packageName: 'com.skt.',
    disable: true,
  },
  {
    vender: 'skt',
    category: 'noise',
    keyword: 'Com.sktelecom.',
    packageName: 'Com.sktelecom.',
    disable: true,
  },
  {
    vender: 'skt',
    category: 'noise',
    keyword: 'com.sktelecom.',
    packageName: 'com.sktelecom.',
    disable: true,
  },
  {
    vender: 'skt',
    category: 'noise',
    keyword: 'com.tms',
    packageName: 'com.tms',
    disable: true,
  },
  {
    vender: 'skt',
    category: 'noise',
    keyword: 'com.skms.',
    packageName: 'com.skms.',
    disable: true,
  },
  {
    vender: 'kt',
    category: 'noise',
    keyword: 'com.kt.',
    packageName: 'com.kt.',
    disable: true,
  },
  {
    vender: 'kt',
    category: 'noise',
    keyword: 'com.ktpns.',
    packageName: 'com.ktpns.',
    disable: true,
  },
  {
    vender: 'kt',
    category: 'noise',
    keyword: 'com.ktshow.',
    packageName: 'com.ktshow.',
    disable: true,
  },
  {
    vender: 'kt',
    category: 'noise',
    keyword: 'com.samsung.hidden.KT',
    packageName: 'com.samsung.hidden.KT',
    disable: true,
  },
  {
    vender: 'kt',
    category: 'noise',
    keyword: 'com.samsung.kt114provider2',
    packageName: 'com.samsung.kt114provider2',
    disable: true,
  },
  {
    vender: 'samsung',
    category: 'noise',
    keyword: 'com.samsung.android.app.spage',
    packageName: 'com.samsung.android.app.spage',
    disable: true,
  },
  {
    vender: 'samsung',
    category: 'noise',
    keyword: 'com.samsung.android.game.gamehome',
    packageName: 'com.samsung.android.game.gamehome',
    disable: true,
  },
  {
    vender: 'samsung',
    category: 'noise',
    keyword: 'com.sec.android.app.samsungapps',
    packageName: 'com.sec.android.app.samsungapps',
    disable: true,
  },
  {
    vender: 'samsung',
    category: 'noise',
    keyword: 'com.samsung.android.bixby.agent',
    packageName: 'com.samsung.android.bixby.agent',
    disable: true,
  },
  {
    vender: 'samsung',
    category: 'noise',
    keyword: 'com.samsung.android.app.omcagent',
    packageName: 'com.samsung.android.app.omcagent',
    disable: true,
  },
  {
    vender: 'samsung',
    category: 'noise',
    keyword: 'com.samsung.android.arzone',
    packageName: 'com.samsung.android.arzone',
    disable: true,
  },
  {
    vender: 'samsung',
    category: 'noise',
    keyword: 'com.samsung.android.app.contacts',
    packageName: 'com.samsung.android.app.contacts',
    disable: true,
  },
  {
    vender: 'samsung',
    category: 'noise',
    keyword: 'com.samsung.android.calendar',
    packageName: 'com.samsung.android.calendar',
    disable: true,
  },
];

const ScamBlockAppList: BlockAppInfo[] = [
  //#region scam
  {
    vender: 'unknown',
    category: 'scam',
    keyword: 'me.nextplus.',
    packageName: 'me.nextplus.smsfreetext.phonecalls',
    runtime: true,
  },
  {
    vender: 'unknown',
    category: 'scam',
    keyword: 'me.dingtone.',
    packageName: 'me.dingtone.app.im',
    runtime: true,
  },
  {
    vender: 'unknown',
    category: 'scam',
    keyword: 'com.gogii.',
    packageName: 'com.gogii.textplus',
    runtime: true,
  },
  {
    vender: 'unknown',
    category: 'scam',
    keyword: 'com.talkatone.',
    packageName: 'com.talkatone.android',
    runtime: true,
  },
  {
    vender: 'unknown',
    category: 'scam',
    keyword: 'me.talkyou.',
    packageName: 'me.talkyou.app.im',
    runtime: true,
  },
  {
    vender: 'unknown',
    category: 'scam',
    keyword: 'com.textmeinc.',
    packageName: 'com.textmeinc.textme',
    runtime: true,
  },
  {
    vender: 'unknown',
    category: 'scam',
    keyword: 'com.iplum.',
    packageName: 'com.iplum.android',
    runtime: true,
  },
  {
    vender: 'unknown',
    category: 'scam',
    keyword: 'com.whatsapp',
    packageName: 'com.whatsapp',
    runtime: true,
  },
  //#endregion
];

if (undefined === process.env.DOGU_UNBLOCK_SCAM_APPS) {
  BlockAppList.push(...ScamBlockAppList);
}

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
  public name = 'AndroidSharedDeviceService';
  public platform = Platform.PLATFORM_ANDROID;
  private logcatProc: child_process.ChildProcess | undefined = undefined;
  private zombieWaiter: ZombieQueriable;
  private setupState = 'none';
  private timer: CheckTimer;
  private adb: AdbSerial;

  constructor(
    public serial: Serial,
    private appiumAdb: AppiumAdb,
    private androidProps: AndroidPropInfo,
    private systemInfo: DeviceSystemInfo,
    private appiumContext: AppiumContextImpl,
    private reset: AndroidResetService,
    private deviceAgent: AndroidDeviceAgentService,
    public printable: SerialPrintable,
  ) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
    this.timer = new CheckTimer({ logger: printable });
    this.adb = new AdbSerial(serial, printable);
  }

  async wait(): Promise<void> {
    await this.zombieWaiter?.waitUntilAlive();
  }

  delete(): void {
    ZombieServiceInstance.deleteComponent(this);
  }

  get props(): ZombieProps {
    return {
      setupState: this.setupState,
    };
  }

  async setup(channel: AndroidChannel): Promise<void> {
    if (!env.DOGU_DEVICE_IS_SHAREABLE) {
      return;
    }
    const { serial, printable: logger, adb } = this;
    if (await this.reset.isDirty()) {
      await this.checkSetup(`AndroidSharedDeviceService.setup.reset`, this.reset.reset(this.systemInfo, this.appiumAdb, this.appiumContext));
      throw new Error(`AndroidSharedDeviceService.revive. device is dirty. so trigger reset ${serial}`);
    }

    const newAppiumAdb = this.appiumAdb.clone({ adbExecTimeout: 1000 * 60 * 3 });
    await this.checkSetup(`AndroidSharedDeviceService.setup.setDeviceLocale`, newAppiumAdb.setDeviceLocale('en-US'));

    await this.checkSetup(`AndroidSharedDeviceService.setup.allowNonMarketApps`, adb.allowNonMarketApps()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.allowNonMarketApps failed.`, { serial, error: errorify(e) });
    });

    await this.checkSetup(`AndroidSharedDeviceService.setup.disableGooglePlayProtect`, adb.disableGooglePlayProtect()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.disableGooglePlayProtect failed.`, { serial, error: errorify(e) });
    });

    await this.checkSetup(`AndroidSharedDeviceService.setup.preInstallApps`, this.preInstallApps()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.preInstallApps failed.`, { serial, error: errorify(e) });
    });

    await this.checkSetup(`AndroidSharedDeviceService.setup.setGboardAsDefaultKeyboard`, this.setGboardAsDefaultKeyboard()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.setGboardAsDefaultKeyboard failed.`, { serial, error: errorify(e) });
    });

    await this.checkSetup(`AndroidSharedDeviceService.setup.mute`, this.mute()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.mute failed.`, { serial, error: errorify(e) });
    });

    await this.checkSetup(`AndroidSharedDeviceService.setup.setBrightness`, adb.setBrightness(50)).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.setBrightness failed.`, { serial, error: errorify(e) });
    });

    await this.checkSetup(`AndroidSharedDeviceService.setup.disableBluetooth`, adb.disableBluetooth());
    await this.checkSetup(`AndroidSharedDeviceService.setup.joinWifi`, adb.joinWifi(env.DOGU_WIFI_SSID, env.DOGU_WIFI_PASSWORD));

    await this.checkSetup(`AndroidSharedDeviceService.setup.stayOnWhilePluggedIn`, adb.stayOnWhilePluggedIn()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.stayOnWhilePluggedIn failed.`, { serial, error: errorify(e) });
    });

    await this.checkSetup(`AndroidSharedDeviceService.setup.clearActivityHostory`, this.clearActivityHostory()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.clearActivityHostory failed.`, { serial, error: errorify(e) });
    });
    await this.checkSetup(`AndroidSharedDeviceService.setup.closeDialog`, this.closeDialog()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.closeDialog failed.`, { serial, error: errorify(e) });
    });

    const packages = await adb.getIntalledPackages();
    if (0 === packages.length) {
      throw new Error(`AndroidSharedDeviceService.setup. no packages`);
    }
    for (const app of packages) {
      const matched = BlockAppList.filter((block) => app.packageName.startsWith(block.keyword));
      if (0 === matched.length) {
        continue;
      }
      await adb.killPackage(app.packageName).catch((e) => {
        this.printable.error(`AndroidSharedDeviceService.revive.killPackage failed.`, { serial, error: errorify(e) });
      });
      await adb.disablePackage(app.packageName, 0).catch((e) => {
        this.printable.error(`AndroidSharedDeviceService.revive.disablePackage failed.`, { error: errorify(e) });
      });
    }
    await this.reset.makeDirty();

    this.setupState = 'done';
  }

  async revive(): Promise<void> {
    if (!env.DOGU_DEVICE_IS_SHAREABLE) {
      return;
    }
    const { serial, printable: logger } = this;
    this.printable.info(`AndroidSharedDeviceService.revive. begin `, { serial });
    await this.startLogcatProcess(serial, logger);
    this.printable.info(`AndroidSharedDeviceService.revive. done `, { serial });
  }

  async update(): Promise<void> {
    if (!env.DOGU_DEVICE_IS_SHAREABLE) {
      return;
    }
    const { adb } = this;
    const appInfos = await adb.getForegroundPackage();
    const filteredList = appInfos.filter((app) => app.displayId === 0 && 0 < this.filterMsgThatContainsBlockApp(app.packageName).length);
    for (const filtered of filteredList) {
      await adb.killPackage(filtered.packageName).catch((e) => {
        this.printable.error(`AndroidSharedDeviceService. update. killPackage failed.`, { e });
      });
    }
    await delay(3000);
  }

  onDie(reason: string): void | Promise<void> {
    this.killLogcatProcess();
  }

  /*
   *block
   */

  private async startLogcatProcess(serial: Serial, logger: FilledPrintable): Promise<void> {
    const { adb } = this;
    const openTime = await adb.getTime();
    if (openTime) {
      const killPackageIfContains = (msg: string): void => {
        const filtered = this.filterMsgThatContainsBlockApp(msg);
        for (const app of filtered) {
          adb.killPackage(app.packageName).catch((e) => {
            logger.error(e);
          });
        }
      };
      this.logcatProc = adb.logcat(['-e', StartActivityLogKeyword, '-T', `${openTime}`], {
        info: (msg) => killPackageIfContains(stringify(msg)),
        error: (msg) => killPackageIfContains(stringify(msg)),
      });
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
      if (!app.runtime) {
        continue;
      }
      if (msg.includes(app.keyword)) {
        if (app.skipOnTestHarness && isHarnessEnabled(this.androidProps)) {
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
    const { adb } = this;
    for (const app of PreinstallApps) {
      if (!fs.existsSync(app.filePath())) {
        this.printable.warn(`AndroidSharedDeviceService.preInstallApps. file not exists.`, { app });
        continue;
      }
      await adb.installAppForce(app.filePath());
    }
  }

  private async setGboardAsDefaultKeyboard(): Promise<void> {
    const { adb } = this;
    for await (const _ of loop(1000, 10)) {
      const filteredPackages = (await adb.getIntalledPackages()).filter((pkg) => pkg.packageName.includes(GboardAppInfo.packageName));
      if (0 < filteredPackages.length) {
        break;
      }
    }
    const filteredPackages = (await adb.getIntalledPackages()).filter((pkg) => pkg.packageName.includes(GboardAppInfo.packageName));
    if (0 === filteredPackages.length) {
      this.printable.warn(`AndroidSharedDeviceService.setGboardAsDefaultKeyboard. gboard is not installed.`, { filteredPackages });
      return;
    }
    for await (const _ of loop(1000, 10)) {
      const targetIme = (await adb.getIMEList()).find((ime) => ime.packageName.includes(GboardAppInfo.packageName));
      if (targetIme) {
        break;
      }
    }
    const targetIme = (await adb.getIMEList()).find((ime) => ime.packageName.includes(GboardAppInfo.packageName));
    if (!targetIme) {
      this.printable.warn(`AndroidSharedDeviceService.setGboardAsDefaultKeyboard. gboard is not in ime.`, { targetIme });
      return;
    }

    const imeId = `${targetIme.packageName}/${targetIme.service}`;
    await this.appiumAdb.enableIME(imeId);
    await this.appiumAdb.setIME(imeId);
  }

  private async mute(): Promise<void> {
    const { adb } = this;
    await adb.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_UP);
    await adb.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_MUTE);
    await adb.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_DOWN);
    await adb.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_DOWN);
    await adb.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_DOWN);
    await adb.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MUTE);
  }

  private async closeDialog(): Promise<void> {
    const { adb } = this;
    for await (const _ of loop(30, 5)) {
      await adb.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_BACK);
    }
  }

  private async clearActivityHostory(): Promise<void> {
    const { adb, appiumContext } = this;
    await adb.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_BACK);
    await adb.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_BACK);

    await adb.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_APP_SWITCH);
    const driver = appiumContext.driver();
    if (!driver) {
      throw new Error(`AndroidResetService.disableLocationGoogleAccuracy Appium Driver is not found`);
    }
    const aosDriver = new AndroidWebDriver(driver, this.printable);

    const closeAll = await aosDriver.waitElementsExist(`android=new UiSelector().text("Close all")`, { seconds: 3 });
    if (0 < closeAll.length) {
      await closeAll[0].click();
    }

    await adb.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_BACK);
    await adb.keyevent(DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_BACK);
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

  private async checkSetup<T>(name: string, promise: Promise<T>): Promise<T> {
    this.setupState = name;
    return this.timer.check(name, promise);
  }
}
