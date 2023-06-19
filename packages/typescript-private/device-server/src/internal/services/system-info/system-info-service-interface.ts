import { DeviceSystemInfo, Serial } from '@dogu-private/types';
import { PromiseOrValue } from '@dogu-tech/common';

export interface SystemInfoService {
  createSystemInfo(serial: Serial): PromiseOrValue<DeviceSystemInfo>;
}
