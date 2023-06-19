import { PlatformType } from '../platforms';

export type DeviceId = string;
export type Serial = string;
export type LocalDeviceDetectToken = string;
export const DEVICE_TABLE_NAME = 'device';
export interface PlatformSerial {
  platform: PlatformType;
  serial: Serial;
}
