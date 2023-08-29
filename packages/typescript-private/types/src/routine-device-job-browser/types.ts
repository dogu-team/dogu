import { BrowserName } from '@dogu-tech/types';
import { RoutineDeviceJobId } from '../routine-device-job/types';

export type RoutineDeviceJobBrowserId = string;
export const ROUTINE_DEVICE_JOB_BROWSER_TABLE_NAME = 'routine_device_job_browser';

export const ROUTINE_DEVICE_JOB_BROWSER_BROWSER_NAME_MAX_LENGTH = 32;
export const ROUTINE_DEVICE_JOB_BROWSER_BROWSER_VERSION_MAX_LENGTH = 32;
export const ROUTINE_DEVICE_JOB_BROWSER_PLATFORM_NAME_MAX_LENGTH = 32;

export interface RoutineDeviceJobBrowser {
  routineDeviceJobBrowserId: RoutineDeviceJobBrowserId;
  routineDeviceJobId: RoutineDeviceJobId;
  browserName: BrowserName;
  browserVersion: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
