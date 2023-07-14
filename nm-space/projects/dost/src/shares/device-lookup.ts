import { PlatformSerial } from '@dogu-private/types';
import { instanceKeys } from './electron-ipc';

export const deviceLookupClientKey = instanceKeys<IDeviceLookupClient>('deviceLookupClient');

export interface DeviceValidateResult {
  isOk: boolean;
  error: string;
}

export interface IDeviceLookupClient {
  getPlatformSerials(): Promise<PlatformSerial[]>;
  validateDevice(platformSerial: PlatformSerial): Promise<DeviceValidateResult>;
}
