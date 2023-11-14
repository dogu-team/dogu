import { Platform, Serial } from '@dogu-private/types';
import { PromiseOrValue } from '@dogu-tech/common';
import { DeviceChannel, DeviceChannelOpenParam } from './device-channel';

export const DeviceScanStatus = [
  'online', // State where open is possible
  'unstable', // State where open isn't possible and close isn't possible
] as const;
export type DeviceScanStatus = (typeof DeviceScanStatus)[number];
export interface DeviceScanResultOnline {
  serial: Serial;
  name: string;
  status: 'online';
}

export interface DeviceScanResultUnstable {
  serial: Serial;
  name: string;
  status: 'unstable';
  description: string;
}

export type DeviceScanResult = DeviceScanResultOnline | DeviceScanResultUnstable;

export interface DeviceDriver {
  get platform(): Platform;
  scanSerials(): PromiseOrValue<DeviceScanResult[]>;
  openChannel(initParam: DeviceChannelOpenParam): PromiseOrValue<DeviceChannel>;
  closeChannel(serial: Serial): PromiseOrValue<void>;
  reset(): PromiseOrValue<void>;
}
