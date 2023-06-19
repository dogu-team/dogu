import { Platform, Serial } from '@dogu-private/types';
import { PromiseOrValue } from '@dogu-tech/common';
import { DeviceChannel, DeviceChannelOpenParam } from './device-channel';

export interface DeviceDriver {
  get platform(): Platform;
  scanSerials(): PromiseOrValue<Serial[]>;
  openChannel(initParam: DeviceChannelOpenParam): PromiseOrValue<DeviceChannel>;
  closeChannel(serial: Serial): PromiseOrValue<void>;
  reset(): PromiseOrValue<void>;
}
