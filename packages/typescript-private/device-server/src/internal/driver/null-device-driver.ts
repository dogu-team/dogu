import { Platform, Serial } from '@dogu-private/types';
import { DeviceChannel, DeviceChannelOpenParam } from '../public/device-channel';
import { DeviceDriver } from '../public/device-driver';

export class NullDeviceDriver implements DeviceDriver {
  get platform(): Platform {
    return Platform.PLATFORM_UNSPECIFIED;
  }
  async scanSerials(): Promise<Serial[]> {
    return await Promise.resolve(new Array<Serial>());
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
