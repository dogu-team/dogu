import { DeviceSystemInfo, Platform, PrivateProtocol, Serial } from '@dogu-private/types';
import { delay, FilledPrintable } from '@dogu-tech/common';
import child_process from 'child_process';
import { env } from '../../../env';
import { IdeviceInstaller } from '../../externals/cli/ideviceinstaller';
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
  uninstall?: true;
  runtime?: true;
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
    bundleId: 'com.apple.mobileslideshow',
    uninstall: true,
  },
  {
    bundleId: 'com.apple.Fitness',
    uninstall: true,
  },
  // access block
  {
    bundleId: 'com.apple.Preferences',
    runtime: true,
  },
  {
    bundleId: 'com.apple.mobilephone',
    runtime: true,
  },
  {
    bundleId: 'com.apple.MobileSMS',
    runtime: true,
  },
  {
    bundleId: 'com.apple.DocumentsApp',
    runtime: true,
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

  async setup(): Promise<void> {
    if (!env.DOGU_IS_DEVICE_SHARE) {
      return;
    }
    const uninstallApps = BlockAppList.filter((item) => item.uninstall).map((item) => item.bundleId);
    for (const app of uninstallApps) {
      await IdeviceInstaller.uninstallApp(this.serial, app, this.printable);
    }
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
      if (BlockAppList.find((item) => item.runtime && item.bundleId === app.bundleId)) {
        await this.wda.terminateApp(app.bundleId);
      }
    }
    await delay(1000);
  }

  onDie(): void {}
}
