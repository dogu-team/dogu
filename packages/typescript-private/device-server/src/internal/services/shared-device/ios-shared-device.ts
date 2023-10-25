import { DeviceSystemInfo, input, Platform, PrivateProtocol, Serial } from '@dogu-private/types';
import { delay, FilledPrintable, stringify } from '@dogu-tech/common';
import { killChildProcess } from '@dogu-tech/node';
import child_process from 'child_process';
import { env } from '../../../env';
import { IdeviceSyslog } from '../../externals/index';
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
  keyword: string;
  packageName: string;
}

const BlockAppList: BlockAppInfo[] = [
  {
    keyword: 'com.apple.Preferences', // block settings
    packageName: 'com.apple.Preferences',
  },
];

const RunningBoardProcessName = 'runningboardd';

export class IosSharedDeviceService implements Zombieable {
  public name = 'IosSharedDeviceService';
  public platform = Platform.PLATFORM_IOS;
  private logcatProc: child_process.ChildProcess | undefined = undefined;
  private zombieWaiter: ZombieQueriable;
  constructor(public serial: Serial, private systemInfo: DeviceSystemInfo, private deviceAgent: IosDeviceAgentService, public printable: FilledPrintable) {
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
    this.printable.info(`IosSharedDeviceService.revive. begin `, { serial });
    this.startLogcatProcess(serial, logger);
    this.printable.info(`IosSharedDeviceService.revive. done `, { serial });
    await delay(0);
  }

  onDie(): void {
    this.killLogcatProcess();
  }

  /*
   *block
   */

  private startLogcatProcess(serial: Serial, logger: FilledPrintable): void {
    const killPackageIfContains = (msg: string): void => {
      const filtered = this.filterMsgThatContainsBlockApp(msg);
      if (0 === filtered.length) {
        return;
      }
      const sendHome = (isDown: boolean): void => {
        this.deviceAgent
          .sendWithProtobuf('dcGdcDaControlParam', 'dcGdcDaControlResult', {
            control: {
              ...input.DefaultDeviceControl(),
              type: DeviceControlType.DEVICE_CONTROL_TYPE_IOS_INJECT_KEYCODE,
              text: '',
              action: isDown ? DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_KEYEVENT_ACTION_DOWN_UNSPECIFIED : DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_KEYEVENT_ACTION_UP,
              metaState: DeviceControlMetaState.DEVICE_CONTROL_META_STATE_UNSPECIFIED,
              keycode: DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_HOME,
            },
          })
          .catch((e) => {
            logger.error(`Failed to send control to device agent.`, { error: e });
          });
      };
      sendHome(true);
      setTimeout(() => {
        sendHome(false);
      }, 200);
    };
    this.logcatProc = IdeviceSyslog.logcatPure(
      serial,
      ['-p', RunningBoardProcessName, '-m', 'will be created as active'],
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

  private filterMsgThatContainsBlockApp(msg: string): BlockAppInfo[] {
    const ret: BlockAppInfo[] = [];
    for (const app of BlockAppList) {
      if (msg.includes(app.keyword)) {
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
