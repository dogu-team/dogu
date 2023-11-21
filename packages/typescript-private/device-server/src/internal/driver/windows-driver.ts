import { Platform, Serial } from '@dogu-private/types';
import { errorify } from '@dogu-tech/common';
import systeminformation from 'systeminformation';
import { logger } from '../../logger/logger.instance';
import { WindowsChannel } from '../channel/windows-channel';
import { DeviceChannel, DeviceChannelOpenParam, DeviceServerService } from '../public/device-channel';
import { DeviceDriver, DeviceScanResult } from '../public/device-driver';

export class WindowsDriver implements DeviceDriver {
  private channelMap = new Map<Serial, WindowsChannel>();

  private constructor(private readonly deviceServerService: DeviceServerService) {}

  static async create(deviceServerService: DeviceServerService): Promise<WindowsDriver> {
    return new WindowsDriver(deviceServerService);
  }

  get platform(): Platform {
    return Platform.PLATFORM_WINDOWS;
  }

  async scanSerials(): Promise<DeviceScanResult[]> {
    const uuid = await systeminformation.uuid();
    const model = (await systeminformation.system()).model;
    return [{ serial: uuid.os, status: 'online', model }];
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    return await WindowsChannel.create(initParam, this.deviceServerService);
  }

  async closeChannel(seial: Serial): Promise<void> {
    const channel = this.channelMap.get(seial);
    if (channel) {
      await channel.close().catch((error) => {
        logger.error('Failed to close channel', { error: errorify(error) });
      });
      this.channelMap.delete(seial);
    }
  }

  async reset(): Promise<void> {
    logger.warn('WindowsDriver.reset is not implemented');
    return await Promise.resolve();
  }
}
