import { DeviceId, OrganizationId, RoutineDeviceJobId } from '@dogu-private/types';

export interface DeviceJobRegistryKeySource {
  organizationId: OrganizationId;
  deviceId: DeviceId;
  routineDeviceJobId: RoutineDeviceJobId;
}
