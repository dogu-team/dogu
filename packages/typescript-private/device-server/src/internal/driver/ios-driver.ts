import { Platform, Serial } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import { HostPaths } from '@dogu-tech/node';
import fs from 'fs';
import { env } from '../../env';
import { createGdcLogger, logger } from '../../logger/logger.instance';
import { IosChannel } from '../channel/ios-channel';
import { SystemProfiler, XcodeBuild, Xctrace } from '../externals';
import { DeviceChannel, DeviceChannelOpenParam, DeviceServerService } from '../public/device-channel';
import { DeviceDriver, DeviceScanResult } from '../public/device-driver';
import { PionStreamingService } from '../services/streaming/pion-streaming-service';

export class IosDriver implements DeviceDriver {
  private channelMap = new Map<Serial, IosChannel>();

  private constructor(private readonly streaming: PionStreamingService, private readonly deviceServerService: DeviceServerService) {}

  static async create(deviceServerService: DeviceServerService): Promise<IosDriver> {
    await IosDriver.clearIdaClones();
    await XcodeBuild.validateXcodeBuild();

    const streaming = await PionStreamingService.create(Platform.PLATFORM_IOS, env.DOGU_DEVICE_SERVER_PORT, createGdcLogger(Platform.PLATFORM_IOS));
    return new IosDriver(streaming, deviceServerService);
  }

  get platform(): Platform {
    return Platform.PLATFORM_IOS;
  }

  async scanSerials(): Promise<DeviceScanResult[]> {
    const deviceInfosFromXctrace = await Xctrace.listDevices(logger);
    const serialsSystemProfiler = await SystemProfiler.usbDataTypeToSerials();
    const deviceInfos: DeviceScanResult[] = [];

    for (const deviceInfoFromXctrace of deviceInfosFromXctrace) {
      if (serialsSystemProfiler.includes(deviceInfoFromXctrace.serial)) {
        deviceInfos.push({
          serial: deviceInfoFromXctrace.serial,
          name: deviceInfoFromXctrace.name,
          status: 'online',
        });
      } else {
        deviceInfos.push({
          serial: deviceInfoFromXctrace.serial,
          name: deviceInfoFromXctrace.name,
          status: 'usb-disconnected',
          description: `Device usb connection is unstable. Please check the usb connection.`,
        });
      }
    }

    return deviceInfos;
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    const channel = await IosChannel.create(initParam, this.streaming, this.deviceServerService);
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
    return await this.streaming.deviceDisconnected(serial);
  }

  reset(): void {
    throw new Error('Method not implemented.');
  }

  static async clearIdaClones(): Promise<void> {
    const idaRunspacesPath = HostPaths.external.xcodeProject.idaDerivedDataClonePath();
    if (fs.existsSync(idaRunspacesPath)) {
      await fs.promises.rm(idaRunspacesPath, { recursive: true });
    }
    await fs.promises.mkdir(idaRunspacesPath, { recursive: true });
  }
}
