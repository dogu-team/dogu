import { BrowserName } from '../browsers';
import { DeviceId } from '../device/types';

export type DeviceBrowserInstallationId = string;
export const DEVICE_BROWSER_INSTALLATION_TABLE_NAME = 'device_browser_installation';
export const DEVICE_BROWSER_INSTALLATION_BROWSER_NAME_MAX_LENGTH = 32;
export const DEVICE_BROWSER_INSTALLATION_BROWSER_VERSION_MAX_LENGTH = 32;

export interface DeviceBrowserInstallation {
  deviceBrowserInstallationId: DeviceBrowserInstallationId;
  browserName: BrowserName;
  browserVersion: string;
  deviceId: DeviceId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
