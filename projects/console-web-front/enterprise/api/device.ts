import { EnableDeviceDtoBase } from '@dogu-private/console';
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
