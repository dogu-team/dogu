import { AttachTagToDeviceDtoBase, DeviceBase, UpdateDeviceDtoBase } from '@dogu-private/console';
import { DeviceId, DeviceTagId, HostId, OrganizationId, ProjectId } from '@dogu-private/types';
import { GetServerSidePropsContext } from 'next';

import api from 'src/api';
import { EmptyTokenError, getServersideCookies } from '../utils/auth';

export const getDeviceCpuRuntimeInfo = async (organizationId: OrganizationId, hostId: HostId, deviceId: string) => {
  const query = new URLSearchParams({
    timeStart: '-1h',
    timeEnd: '-0h',
    measurement: 'device_cpu',
    fieldKey: 'currentLoad',
  });
  const data = await api.get(
    `/organizations/${organizationId}/hosts/${hostId}/devices/${deviceId}/runtime/?${query.toString()}`,
  );

  return data;
};

export const addDevice = async (organizationId: OrganizationId, hostId: HostId, deviceId: DeviceId) => {
  const data = await api.post<DeviceBase>(`/organizations/${organizationId}/hosts/${hostId}/devices`, { id: deviceId });
  return data;
};

export const deleteDevice = async (organizationId: OrganizationId, deviceId: DeviceId) => {
  const data = await api.delete<DeviceBase>(`/organizations/${organizationId}/devices/${deviceId}`);
  return data.data;
};

export const rebootDevice = async (organizationId: OrganizationId, deviceId: DeviceId) => {
  await api.post(`/organizations/${organizationId}/devices/${deviceId}/reboot`);
};

export const disableDevice = async (organizationId: OrganizationId, deviceId: DeviceId) => {
  return await api.post<void>(`/organizations/${organizationId}/devices/${deviceId}/disable`);
};

export const updateDevice = async (
  organizationId: OrganizationId,
  deviceId: DeviceId,
  updateDeviceBody: UpdateDeviceDtoBase,
) => {
  const { data } = await api.patch<DeviceBase>(
    `/organizations/${organizationId}/devices/${deviceId}`,
    updateDeviceBody,
  );

  return data;
};

export const attachTagToDevice = async (
  organizationId: OrganizationId,
  deviceId: DeviceId,
  attachTagBody: AttachTagToDeviceDtoBase,
) => {
  const { data } = await api.post<void>(`/organizations/${organizationId}/devices/${deviceId}/tags`, attachTagBody);

  return data;
};

export const detachTagFromDevice = async (organizationId: OrganizationId, deviceId: DeviceId, tagId: DeviceTagId) => {
  const { data } = await api.delete<void>(`/organizations/${organizationId}/devices/${deviceId}/tags/${tagId}`);

  return data;
};

export const checkDeviceStateAsync = async (organizationId: OrganizationId, deviceId: DeviceId) => {
  return await api.head<void>(`/organizations/${organizationId}/devices/${deviceId}`);
};

export const removeDeviceFromProject = async (
  organizationId: OrganizationId,
  deviceId: DeviceId,
  projectId: ProjectId,
): Promise<void> => {
  await api.delete<void>(`/organizations/${organizationId}/devices/${deviceId}/projects/${projectId}`);
  return;
};

export const getDeviceByIdInServerSide = async (
  context: GetServerSidePropsContext,
  organizationId: OrganizationId,
  deviceId: DeviceId,
) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    try {
      const response = await api.get<DeviceBase>(`/organizations/${organizationId}/devices/${deviceId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return response.data;
    } catch (e) {
      return null;
    }
  }

  throw new EmptyTokenError();
};
