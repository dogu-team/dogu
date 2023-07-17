import { DeviceSystemInfo, ErrorDevice, PlatformSerial, Serial } from '@dogu-private/types';
import { instanceKeys } from './electron-ipc';

export const deviceLookupClientKey = instanceKeys<IDeviceLookupClient>('deviceLookupClient');

export interface IDeviceLookupClient {
  getPlatformSerials(): Promise<PlatformSerial[]>;
  getDevicesWithError(): Promise<ErrorDevice[]>;
  getDeviceSystemInfo(serial: Serial): Promise<DeviceSystemInfo | null>;
}
