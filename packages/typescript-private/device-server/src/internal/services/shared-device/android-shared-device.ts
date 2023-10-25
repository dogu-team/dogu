import { DeviceSystemInfo, Platform, PrivateProtocol, Serial, SerialPrintable } from '@dogu-private/types';
import { delay, errorify, FilledPrintable, loop, stringify } from '@dogu-tech/common';
import { HostPaths, killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import fs from 'fs';
import { AppiumContextImpl } from '../../../appium/appium.context';
import { env } from '../../../env';
import { AdbSerial, AndroidPropInfo, AppiumAdb, isHarnessEnabled } from '../../externals/index';
import { CheckTimer } from '../../util/check-time';
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

interface BlockAppInfo {
  keyword: string;
  packageName: string;
  skipOnTestHarness?: true;
  disable?: true;
}
const BlockAppList: BlockAppInfo[] = [
  {
    keyword: 'com.skt.prod.dialer', // block galaxy dialer
    packageName: 'com.skt.prod.dialer',
  },
  {
    keyword: 'com.samsung.android.dialer', // block galaxy dialer
    packageName: 'com.samsung.android.dialer',
  },
  {
    keyword: 'com.samsung.android.app.telephonyui', // block galaxy emergency dialer
    packageName: 'com.samsung.android.app.telephonyui',
  },
  {
    skipOnTestHarness: true,
    keyword: 'com.samsung.android.mobileservice', // block galaxy samsung login
    packageName: 'com.samsung.android.mobileservice',
  },
  {
    keyword: 'com.sec.android.soagent', // block galaxy software update
    packageName: 'com.sec.android.soagent',
    disable: true,
  },
  {
    keyword: 'com.wssyncmldm', // block galaxy software update
    packageName: 'com.wssyncmldm',
    disable: true,
  },
  {
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
    this.timer = new CheckTimer(this.printable);
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

  async setup(): Promise<void> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
      return;
    }
    const { serial, printable: logger, adb } = this;
    this.setupState = 'resetting';
    if (await this.reset.isDirty()) {
      await this.timer.check(`AndroidSharedDeviceService.setup.reset`, this.reset.reset(this.systemInfo, this.appiumAdb, this.appiumContext));
      throw new Error(`AndroidSharedDeviceService.revive. device is dirty. so trigger reset ${serial}`);
    }

    this.setupState = 'change-locale';
    const newAppiumAdb = this.appiumAdb.clone({ adbExecTimeout: 1000 * 60 * 3 });
    await this.timer.check(`AndroidSharedDeviceService.setup.setDeviceLocale`, newAppiumAdb.setDeviceLocale('en-US'));

    this.setupState = 'allow-non-market-apps';
    await this.timer.check(`AndroidSharedDeviceService.setup.allowNonMarketApps`, adb.allowNonMarketApps()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.allowNonMarketApps failed.`, { serial, error: errorify(e) });
    });

    this.setupState = 'disable-google-play-protect';
    await this.timer.check(`AndroidSharedDeviceService.setup.disableGooglePlayProtect`, adb.disableGooglePlayProtect()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.disableGooglePlayProtect failed.`, { serial, error: errorify(e) });
    });

    this.setupState = 'preinstalling';
    await this.timer.check(`AndroidSharedDeviceService.setup.preInstallApps`, this.preInstallApps()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.preInstallApps failed.`, { serial, error: errorify(e) });
    });

    this.setupState = 'set-gboard-as-default-keyboard';
    await this.timer.check(`AndroidSharedDeviceService.setup.setGboardAsDefaultKeyboard`, this.setGboardAsDefaultKeyboard()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.setGboardAsDefaultKeyboard failed.`, { serial, error: errorify(e) });
    });

    this.setupState = 'mute';
    await this.timer.check(`AndroidSharedDeviceService.setup.mute`, this.mute()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.mute failed.`, { serial, error: errorify(e) });
    });

    this.setupState = 'set-brightness';
    await this.timer.check(`AndroidSharedDeviceService.setup.setBrightness`, adb.setBrightness(50)).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.setBrightness failed.`, { serial, error: errorify(e) });
    });

    this.setupState = 'join-wifi';
    await this.timer.check(`AndroidSharedDeviceService.setup.joinWifi`, adb.joinWifi(env.DOGU_WIFI_SSID, env.DOGU_WIFI_PASSWORD)).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.joinWifi failed.`, { serial, error: errorify(e) });
    });

    this.setupState = 'stay-on-while-plugged-in';
    await this.timer.check(`AndroidSharedDeviceService.setup.stayOnWhilePluggedIn`, adb.stayOnWhilePluggedIn()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.stayOnWhilePluggedIn failed.`, { serial, error: errorify(e) });
    });

    this.setupState = 'close-dialog';
    await this.timer.check(`AndroidSharedDeviceService.setup.closeDialog`, this.closeDialog()).catch((e) => {
      this.printable.error(`AndroidSharedDeviceService.revive.closeDialog failed.`, { serial, error: errorify(e) });
    });

    const disableAppList = BlockAppList.filter((app) => app.disable);
    for (const app of disableAppList) {
      await adb.disablePackage(app.packageName, 0).catch((e) => {
        this.printable.error(`AndroidSharedDeviceService.revive.disablePackage failed.`, { error: errorify(e) });
      });
    }
    await this.reset.makeDirty();

    this.setupState = 'setup-done';
  }

  async revive(): Promise<void> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
      return;
    }
    const { serial, printable: logger } = this;
    this.printable.info(`AndroidSharedDeviceService.revive. begin `, { serial });
    await this.startLogcatProcess(serial, logger);
    this.printable.info(`AndroidSharedDeviceService.revive. done `, { serial });
  }

  async update(): Promise<void> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
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

  onDie(): void | Promise<void> {
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
    // for await (const _ of loop(30, 20)) { <- hang error
    //   await this.deviceAgent.sendWithProtobuf('dcDaControlParam', 'dcDaControlReturn', {
    //     control: {
    //       ...input.DefaultDeviceControl(),
    //       type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_KEYCODE,
    //       text: '',
    //       action: DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_KEYEVENT_ACTION_DOWN_UNSPECIFIED,
    //       metaState: DeviceControlMetaState.DEVICE_CONTROL_META_STATE_UNSPECIFIED,
    //       keycode: DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_DOWN,
    //     },
    //   });
    //   await this.deviceAgent.sendWithProtobuf('dcDaControlParam', 'dcDaControlReturn', {
    //     control: {
    //       ...input.DefaultDeviceControl(),
    //       type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_KEYCODE,
    //       text: '',
    //       action: DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_KEYEVENT_ACTION_UP,
    //       metaState: DeviceControlMetaState.DEVICE_CONTROL_META_STATE_UNSPECIFIED,
    //       keycode: DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_DOWN,
    //     },
    //   });
    // }
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
