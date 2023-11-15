import { Platform, Serial } from '@dogu-private/types';
import systeminformation from 'systeminformation';
import { env } from '../../env';
import { logger } from '../../logger/logger.instance';
import { LinuxChannel } from '../channel/linux-channel';
import { DeviceChannel, DeviceChannelOpenParam, DeviceServerService } from '../public/device-channel';
import { DeviceDriver, DeviceScanResult } from '../public/device-driver';

export class LinuxDriver implements DeviceDriver {
  private constructor(private readonly deviceServerService: DeviceServerService) {}

  static async create(deviceServerService: DeviceServerService): Promise<LinuxDriver> {
    return new LinuxDriver(deviceServerService);
  }

  get platform(): Platform {
    return Platform.PLATFORM_LINUX;
  }

  async scanSerials(): Promise<DeviceScanResult[]> {
    const hostname = (await systeminformation.osInfo()).hostname;
    const serial = await this.resolveSerial();
    return [{ serial, status: 'online', name: hostname }];
  }

  private async resolveSerial(): Promise<Serial> {
    const serial = env.DOGU_LINUX_DEVICE_SERIAL;
    if (serial) {
      return serial;
    }

    const uuid = await systeminformation.uuid();
    return uuid.hardware;
  }

  async openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    return await LinuxChannel.create(initParam, this.deviceServerService);
  }

  async closeChannel(seial: Serial): Promise<void> {}

  async reset(): Promise<void> {
    logger.warn('LinuxDriver.reset is not implemented');
    return await Promise.resolve();
  }
}
