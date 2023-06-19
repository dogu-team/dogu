import { DeviceJobLog } from '@dogu-private/types';

export const DEVICE_JOB_LOG_LIVE_DELAY_COUNT = 3;
export const DEVICE_JOB_PROFILE_LIVE_DELAY_COUNT = 3;

export interface DeviceJobLogInfo extends DeviceJobLog {
  line: number;
  // deviceJobId: RoutineDeviceJobId;
}
