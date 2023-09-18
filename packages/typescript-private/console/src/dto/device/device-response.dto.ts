import { DeviceBase } from '../../base/device';

export type DeviceResponse = DeviceBase;

export interface GetEnabledDeviceCountResponse {
  enabledMobileCount: number;
  enabledBrowserCount: number;
}
