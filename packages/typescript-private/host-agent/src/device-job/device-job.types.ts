import { OrganizationId, RoutineDeviceJobId } from '@dogu-private/types';

export interface DeviceJobRegistryKeySource {
  organizationId: OrganizationId;
  routineDeviceJobId: RoutineDeviceJobId;
}
