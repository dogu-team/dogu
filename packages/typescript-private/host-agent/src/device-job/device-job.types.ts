import { OrganizationId, RoutineDeviceJobId } from '@dogu-private/types';

export interface DeviceJobRegistryKeySource {
  executorOrganizationId: OrganizationId;
  routineDeviceJobId: RoutineDeviceJobId;
}
