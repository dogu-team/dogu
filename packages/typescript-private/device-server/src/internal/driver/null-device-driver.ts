import { Platform } from '@dogu-private/types';
import { DeviceChannel, DeviceChannelOpenParam } from '../public/device-channel';
import { DeviceDriver, DeviceScanResult } from '../public/device-driver';

export class NullDeviceDriver implements DeviceDriver {
  get platform(): Platform {
    return Platform.PLATFORM_UNSPECIFIED;
  }
  async scanSerials(): Promise<DeviceScanResult[]> {
    return Promise.resolve([]);
  }

  openChannel(initParam: DeviceChannelOpenParam): Promise<DeviceChannel> {
    throw new Error('Method not implemented.');
  }
  closeChannel(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async reset(): Promise<void> {
    return await Promise.resolve();
  }
}
