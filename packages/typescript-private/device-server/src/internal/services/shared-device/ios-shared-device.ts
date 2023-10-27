import { DeviceSystemInfo, Platform, PrivateProtocol, Serial } from '@dogu-private/types';
import { delay, FilledPrintable } from '@dogu-tech/common';
import child_process from 'child_process';
import { env } from '../../../env';
import { WebdriverAgentProcess } from '../../externals/cli/webdriver-agent-process';
import { IosDeviceAgentService } from '../device-agent/ios-device-agent-service';
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
}

const BlockAppList: BlockAppInfo[] = [
  {
    bundleId: 'com.apple.Preferences',
  },
];

const RunningBoardProcessName = 'runningboardd';

export class IosSharedDeviceService implements Zombieable {
  public name = 'IosSharedDeviceService';
  public platform = Platform.PLATFORM_IOS;
  private logcatProc: child_process.ChildProcess | undefined = undefined;
  private zombieWaiter: ZombieQueriable;
  constructor(
    public serial: Serial,
    private systemInfo: DeviceSystemInfo,
    private deviceAgent: IosDeviceAgentService,
    private wda: WebdriverAgentProcess,
    public printable: FilledPrintable,
  ) {
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
  }

  async wait(): Promise<void> {
    await this.zombieWaiter?.waitUntilAlive();
  }

  delete(): void {
    ZombieServiceInstance.deleteComponent(this);
  }

  get props(): ZombieProps {
    return { serial: this.serial };
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
    await this.wda.waitUntilSessionId();
    const activeApps = await this.wda.getActiveAppList();
    for (const app of activeApps) {
      if (BlockAppList.find((item) => item.bundleId === app.bundleId)) {
        await this.wda.terminateApp(app.bundleId);
      }
    }
    await delay(1000);
  }

  onDie(): void {}
}
