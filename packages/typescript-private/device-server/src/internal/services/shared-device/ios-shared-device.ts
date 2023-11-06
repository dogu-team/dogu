import { Platform, PrivateProtocol, Serial } from '@dogu-private/types';
import { delay, FilledPrintable, usingAsnyc } from '@dogu-tech/common';
import child_process from 'child_process';
import { AppiumContextImpl } from '../../../appium/appium.context';
import { env } from '../../../env';
import { config } from '../../config';
import { WebdriverAgentProcess } from '../../externals/cli/webdriver-agent-process';
import { IosAccessibilitiySelector, IosWebDriver, IosWebDriverInfo } from '../../externals/webdriver/ios-webdriver';
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
    private iosWebDriverInfo: IosWebDriverInfo,
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
    return { serial: this.serial, reset_state: this.reset.state };
  }

  async setup(): Promise<void> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
      return;
    }
    const { serial, printable: logger, wda, appiumContext, iosWebDriverInfo } = this;
    const driver = this.appiumContext.driver();
    if (!driver) {
      throw new Error(`IosResetService.clearSafariCache driver is null`);
    }

    if ((await this.reset.isDirty()) && !config.externalIosDeviceAgent.use) {
      await this.timer.check(`IosResetService.setup.reset`, this.reset.reset(appiumContext, wda));
      throw new Error(`IosResetService.revive. device is dirty. so trigger reset ${serial}`);
    }

    const iosDriver = new IosWebDriver(driver, wda, iosWebDriverInfo, logger);
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

  onDie(reason: string): void {}

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
}
