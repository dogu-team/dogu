import { Platform, Serial } from '@dogu-private/types';
import { PromiseOrValue } from '@dogu-tech/common';
import { DeviceChannel, DeviceChannelOpenParam } from './device-channel';

export const DeviceScanStatus = ['online', 'offline', 'unauthorized', 'usb-disconnected', 'unknown'] as const;
export type DeviceScanStatus = (typeof DeviceScanStatus)[number];

export interface DeviceScanFailed {
  serial: Serial;
  name: string;
  status: DeviceScanStatus;
  description: string;
}
export interface DeviceScanOk {
  serial: Serial;
  name: string;
  status: 'online';
}

export type DeviceScanResult = DeviceScanFailed | DeviceScanOk;

export interface DeviceDriver {
  get platform(): Platform;
  scanSerials(): PromiseOrValue<DeviceScanResult[]>;
  openChannel(initParam: DeviceChannelOpenParam): PromiseOrValue<DeviceChannel>;
  closeChannel(serial: Serial): PromiseOrValue<void>;
  reset(): PromiseOrValue<void>;
}
