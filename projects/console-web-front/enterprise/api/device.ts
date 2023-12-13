import { DeviceBase, EnableDeviceDtoBase, UpdateDeviceMaxParallelJobsDtoBase } from '@dogu-private/console';
import { DeviceId, OrganizationId } from '@dogu-private/types';

import api from '../../src/api';

export const enableDevice = async (
  organizationId: OrganizationId,
  deviceId: DeviceId,
  body: EnableDeviceDtoBase,
): Promise<void> => {
  await api.post<void>(`/organizations/${organizationId}/devices/${deviceId}/enable`, body);
  return;
};

export const updateDeviceMaxParallelCount = async (
  orgId: OrganizationId,
  deviceId: DeviceId,
  dto: UpdateDeviceMaxParallelJobsDtoBase,
): Promise<DeviceBase> => {
  const { data } = await api.patch<DeviceBase>(`/organizations/${orgId}/devices/${deviceId}/max-parallel-job`, dto);
  return data;
};
