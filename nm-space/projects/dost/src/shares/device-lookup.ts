import { PlatformSerial } from '@dogu-private/types';
import { instanceKeys } from './electron-ipc';

export const deviceLookupClientKey = instanceKeys<IDeviceLookupClient>('deviceLookupClient');

export interface IDeviceLookupClient {
  getPlatformSerials(): Promise<PlatformSerial[]>;
}
