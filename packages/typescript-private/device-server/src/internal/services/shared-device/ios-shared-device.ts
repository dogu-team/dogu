import { Platform, PrivateProtocol, Serial } from '@dogu-private/types';
import { delay, FilledPrintable, loopTime, usingAsnyc } from '@dogu-tech/common';
import child_process from 'child_process';
import { AppiumContextImpl } from '../../../appium/appium.context';
import { env } from '../../../env';
import { config } from '../../config';
import { IdeviceInstaller } from '../../externals/cli/ideviceinstaller';
import { WebdriverAgentProcess } from '../../externals/cli/webdriver-agent-process';
import { IosAccessibilitiySelector, IosWebDriver } from '../../externals/webdriver/ios-webdriver';
import { CheckTimer } from '../../util/check-time';
import { IosResetService } from '../reset/ios-reset';
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

interface BlockAppInfo {
  bundleId: string;
  uninstall: true;
}

const UninstallSystemAppList: string[] = [];

const BlockAppList: BlockAppInfo[] = [
  // disable
  {
    bundleId: 'com.apple.tv',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Maps',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Health',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.mobilecal',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.mobiletimer',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.mobilemail',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.mobilenotes',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.podcasts',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.reminders',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.facetime',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.weather',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.stocks',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Home',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.iBooks',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.MobileStore',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Bridge', // watch
    uninstall: true,
  },
  {
    bundleId: 'com.apple.MobileAddressBook', // contacts
    uninstall: true,
  },
  {
    bundleId: 'com.apple.shortcuts',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.freeform',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.tips',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.VoiceMemos',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.compass',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Magnifier',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.calculator',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Fitness',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Passbook',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Music',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Translate',
    uninstall: true,
  },
];

const RunningBoardProcessName = 'runningboardd';

export class IosSharedDeviceService implements Zombieable {
  public name = 'IosSharedDeviceService';
  public platform = Platform.PLATFORM_IOS;
  private logcatProc: child_process.ChildProcess | undefined = undefined;
  private zombieWaiter: ZombieQueriable;
  private timer: CheckTimer;
  constructor(
    public serial: Serial,
    private wda: WebdriverAgentProcess,
    private reset: IosResetService,
    private appiumContext: AppiumContextImpl,
    public printable: FilledPrintable,
  ) {
    this.timer = new CheckTimer(this.printable);
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
  }

  async wait(): Promise<void> {
    await this.zombieWaiter?.waitUntilAlive();
  }

  delete(): void {
    ZombieServiceInstance.deleteComponent(this);
  }

  get props(): ZombieProps {
    return { serial: this.serial, resetting: this.reset.isResetting };
  }

  async setup(): Promise<void> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
      return;
    }
    const { serial, printable: logger } = this;
    const driver = this.appiumContext.driver();
    if (!driver) {
      throw new Error(`IosResetService.clearSafariCache driver is null`);
    }

    if ((await this.reset.isDirty()) && !config.externalIosDeviceAgent.use) {
      await this.timer.check(`IosResetService.setup.reset`, this.reset.reset(this.appiumContext));
      throw new Error(`IosResetService.revive. device is dirty. so trigger reset ${serial}`);
    }
    const installer = new IdeviceInstaller(serial, logger);
    const uninstallApps = BlockAppList.filter((item) => item.uninstall).map((item) => item.bundleId);
    for (const app of uninstallApps) {
      await installer.uninstallApp(app);
    }

    const iosDriver = new IosWebDriver(driver);
    await this.checkEnglish(iosDriver);

    await this.reset.makeDirty();
  }

  async revive(): Promise<void> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
      return;
    }
    const { serial, printable: logger } = this;
    logger.info(`IosSharedDeviceService.revive. begin `, { serial });
    logger.info(`IosSharedDeviceService.revive. done `, { serial });
    await delay(0);
  }

  async update(): Promise<void> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
      return;
    }
    if (this.reset.isResetting) {
      return;
    }
  }

  onDie(): void {}

  private async checkEnglish(iosDriver: IosWebDriver): Promise<void> {
    await usingAsnyc(
      {
        create: async () => {
          await iosDriver.relaunchApp('com.apple.Preferences');
        },
        dispose: async () => {
          await iosDriver.terminateApp('com.apple.Preferences');
        },
      },
      async () => {
        await iosDriver.relaunchApp('com.apple.Preferences');
        const elems = await iosDriver.waitElementsExist(new IosAccessibilitiySelector('General'), { seconds: 3 });
        if (0 === elems.length) {
          throw new Error(`IosSharedDeviceService.checkEnglish. failed. language should be english`);
        }
      },
    );
  }

  private async blockControlCenterEnglish(iosDriver: IosWebDriver): Promise<void> {
    for await (const _ of loopTime({ period: { milliseconds: 300 }, expire: { minutes: 5 } })) {
      const elem = await iosDriver.rawDriver.$('~ControlCenterView');
      if (elem.error) {
        continue;
      }
      await iosDriver.rawDriver.execute('mobile: pressButton', {
        name: 'home',
        duration: 0.3,
      });
    }
  }
}
