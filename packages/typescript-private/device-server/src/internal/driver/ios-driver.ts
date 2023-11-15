import { Platform, Serial } from '@dogu-private/types';
import { errorify, loopTime, Milisecond } from '@dogu-tech/common';
import { ChildProcess, HostPaths } from '@dogu-tech/node';
import fs from 'fs';
import { logger } from '../../logger/logger.instance';
import { IosChannel } from '../channel/ios-channel';
import { IdeviceId, SystemProfiler, XcodeBuild, Xctrace } from '../externals';
import { DeviceChannel, DeviceChannelOpenParam, DeviceServerService } from '../public/device-channel';
import { DeviceDriver, DeviceScanResult } from '../public/device-driver';

let ScanResultCache: DeviceScanResult[] = [];
const ScanMethods = ['xctrace', 'idevice-id'];
type ScanMethod = (typeof ScanMethods)[number];
interface IosScanner {
  get method(): ScanMethod;
  get descriptionWhenNotExist(): string;
  scan(option: { timeout: number }): Promise<string[] | 'timeout'>;
}

const IosXctraceScanner: IosScanner = {
  method: 'xctrace',
  descriptionWhenNotExist: 'There is a lost connection between xcode and device.',

  async scan(option: { timeout: number }): Promise<string[] | 'timeout'> {
    const deviceInfosFromXctrace = await Xctrace.listDevices(option).catch((e) => {
      if (ChildProcess.isSigtermError(e)) {
        return 'timeout' as const;
      }
      throw e;
    });
    return deviceInfosFromXctrace;
  },
};

const IosIdeviceIdScanner: IosScanner = {
  method: 'idevice-id',
  descriptionWhenNotExist: 'Device connection is unstable. Please check the connection.',

  async scan(option: { timeout: number }): Promise<string[] | 'timeout'> {
    const deviceInfosFromXctrace = await IdeviceId.listDevices(option).catch((e) => {
      if (ChildProcess.isSigtermError(e)) {
        return 'timeout' as const;
      }
      throw e;
    });
    return deviceInfosFromXctrace;
  },
};

const IosScanners = [IosXctraceScanner, IosIdeviceIdScanner];
export class IosDriver implements DeviceDriver {
  private channelMap = new Map<Serial, IosChannel>();
  public readonly platform = Platform.PLATFORM_IOS;

  private constructor(private readonly deviceServerService: DeviceServerService) {}

  static async create(deviceServerService: DeviceServerService): Promise<IosDriver> {
    await IosDriver.restartUsbMuxd();
    await IosDriver.clearIdaClones();
    await XcodeBuild.validateXcodeBuild();

    return new IosDriver(deviceServerService);
  }

  async scanSerials(): Promise<DeviceScanResult[]> {
    return await IosDriver.scanSerials();
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    const channel = await IosChannel.create(initParam, this.deviceServerService);
    this.channelMap.set(initParam.serial, channel);
    return channel;
  }

  async closeChannel(serial: Serial): Promise<void> {
    const channel = this.channelMap.get(serial);
    if (channel) {
      await channel.close().catch((error) => {
        logger.error('Failed to close channel', { error: errorify(error) });
      });
      this.channelMap.delete(serial);
    }
  }

  reset(): void {
    throw new Error('Method not implemented.');
  }

  static async waitUntilConnected(serial: Serial): Promise<void> {
    for await (const _ of loopTime({ period: { seconds: 3 }, expire: { minutes: 5 } })) {
      const results = await IosDriver.scanSerials().catch((e) => []);
      if (results.find((r) => r.serial === serial && r.status === 'online')) {
        return;
      }
    }
    throw new Error(`Wait until device ${serial} connected failed. Please check the usb connection.`);
  }

  static async waitUntilDisonnected(serial: Serial): Promise<void> {
    for await (const _ of loopTime({ period: { seconds: 3 }, expire: { minutes: 5 } })) {
      const results = await IosDriver.scanSerials().catch((e) => []);
      const some = results.find((r) => r.serial === serial);
      if (!some) {
        return;
      }
    }
    throw new Error(`Wait until device ${serial} disconnected failed.`);
  }

  private static async scanSerials(): Promise<DeviceScanResult[]> {
    const option = { timeout: Milisecond.t5Seconds };

    const serialToResults = new Map<Serial, ScanMethod[]>();
    for (const scanner of IosScanners) {
      const scanResults = await scanner.scan(option);
      if (scanResults === 'timeout') {
        return ScanResultCache;
      }
      for (const result of scanResults) {
        const prev = serialToResults.get(result);
        if (prev) {
          prev.push(scanner.method);
          continue;
        }
        serialToResults.set(result, [scanner.method]);
      }
    }
    const ret: DeviceScanResult[] = [];
    for (const serialToResult of serialToResults) {
      const [serial, methods] = serialToResult;
      const notfoundMethods = ScanMethods.filter((method) => !methods.includes(method));

      const serialsSystemProfiler = await SystemProfiler.usbDataTypeToSerials(option);
      if (!serialsSystemProfiler.includes(serial)) {
        ret.push({ serial, name: serial, status: 'unstable', description: 'Device usb connection is unstable. Please check the usb connection.' });
        continue;
      }
      if (notfoundMethods.length === 0) {
        ret.push({ serial, name: serial, status: 'online' });
        continue;
      }
      const notfountMethod = notfoundMethods[0];
      const description = IosScanners.find((scanner) => scanner.method === notfountMethod)?.descriptionWhenNotExist;
      ret.push({ serial, name: serial, status: 'unstable', description: description ?? 'unknown' });
    }
    ScanResultCache = ret;

    return ret;
  }

  private static async clearIdaClones(): Promise<void> {
    const idaRunspacesPath = HostPaths.external.xcodeProject.idaDerivedDataClonePath();
    if (fs.existsSync(idaRunspacesPath)) {
      await fs.promises.rm(idaRunspacesPath, { recursive: true });
    }
    await fs.promises.mkdir(idaRunspacesPath, { recursive: true });
  }

  // not work
  private static async restartUsbMuxd(): Promise<void> {
    logger.info('Restarting usbmuxd');
    const ret = await ChildProcess.exec('launchctl stop com.apple.usbmuxd', {}).catch(() => {
      logger.warn('Failed to stop usbmuxd');
    });
    logger.info('stop usbmuxd done', { ret });
    const ret2 = await ChildProcess.exec('launchctl start com.apple.usbmuxd', {}).catch(() => {
      logger.warn('Failed to start usbmuxd');
    });
    logger.info('start usbmuxd done', { ret2 });
  }
}
