import { BrowserName } from '../browsers';
import { DeviceId } from '../device/types';

export type DeviceBrowserId = number;
export const DEVICE_BROWSER_TABLE_NAME = 'device_browser';
export const DEVICE_BROWSER_BROWSER_NAME_MAX_LENGTH = 32;
export const DEVICE_BROWSER_BROWSER_VERSION_MAX_LENGTH = 32;

export interface DeviceBrowser {
  deviceBrowserId: DeviceBrowserId;
  browserName: BrowserName;
  browserVersion: string;
  isInstalled: number;
  deviceId: DeviceId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
