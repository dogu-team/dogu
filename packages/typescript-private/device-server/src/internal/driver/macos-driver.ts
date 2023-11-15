import { Platform, Serial } from '@dogu-private/types';
import systeminformation from 'systeminformation';
import { logger } from '../../logger/logger.instance';
import { MacosChannel } from '../channel/macos-channel';
import { DeviceChannel, DeviceChannelOpenParam, DeviceServerService } from '../public/device-channel';
import { DeviceDriver, DeviceScanResult } from '../public/device-driver';

export class MacosDriver implements DeviceDriver {
  private constructor(private readonly deviceServerService: DeviceServerService) {}

  static async create(deviceServerService: DeviceServerService): Promise<MacosDriver> {
    return new MacosDriver(deviceServerService);
  }

  get platform(): Platform {
    return Platform.PLATFORM_MACOS;
  }

  async scanSerials(): Promise<DeviceScanResult[]> {
    const hostname = (await systeminformation.osInfo()).hostname;
    const uuid = await systeminformation.uuid();
    return [{ serial: uuid.os, status: 'online', name: hostname }];
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    return await MacosChannel.create(initParam, this.deviceServerService);
  }

  async closeChannel(seial: Serial): Promise<void> {}

  async reset(): Promise<void> {
    logger.warn('MacosDriver.reset is not implemented');
    return await Promise.resolve();
  }
}
