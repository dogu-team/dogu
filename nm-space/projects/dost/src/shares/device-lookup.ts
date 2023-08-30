import { DeviceConnectionSubscribeReceiveMessage } from '@dogu-tech/device-client-common';
import { instanceKeys } from './electron-ipc';

export const deviceLookupClientKey = instanceKeys<IDeviceLookupClient>('deviceLookupClient');

export interface IDeviceLookupClient {
  getSubscribeMessages(): Promise<DeviceConnectionSubscribeReceiveMessage[]>;
}
