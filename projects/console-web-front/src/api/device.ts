import { AttachTagToDeviceDtoBase, DeviceBase, DeviceStreamingOffer, EnableDeviceDtoBase, UpdateDeviceDtoBase } from '@dogu-private/console';
import { DeviceId, DeviceTagId, HostId, OrganizationId, ProjectId, ProtoRTCPeerDescription } from '@dogu-private/types';

import { sdpExt } from '@dogu-private/webrtc';
import api from 'src/api';

export const getDeviceCpuRuntimeInfo = async (organizationId: OrganizationId, hostId: HostId, deviceId: string) => {
  const query = new URLSearchParams({
    timeStart: '-1h',
    timeEnd: '-0h',
    measurement: 'device_cpu',
    fieldKey: 'currentLoad',
  });
  const data = await api.get(`/organizations/${organizationId}/hosts/${hostId}/devices/${deviceId}/runtime/?${query.toString()}`);

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

export const updateDevice = async (organizationId: OrganizationId, deviceId: DeviceId, updateDeviceBody: UpdateDeviceDtoBase) => {
  const { data } = await api.patch<DeviceBase>(`/organizations/${organizationId}/devices/${deviceId}`, updateDeviceBody);

  return data;
};

export const attachTagToDevice = async (organizationId: OrganizationId, deviceId: DeviceId, attachTagBody: AttachTagToDeviceDtoBase) => {
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

export const startDeviceStreaming = async (organizationId: OrganizationId, deviceId: DeviceId, streamingBody: DeviceStreamingOffer): Promise<RTCSessionDescription> => {
  const { data } = await api.post<ProtoRTCPeerDescription>(`/organizations/${organizationId}/devices/${deviceId}/streaming`, streamingBody);
  return sdpExt.convertSdpFromProtoToTs(data);
};

export const enableDevice = async (organizationId: OrganizationId, deviceId: DeviceId, body: EnableDeviceDtoBase): Promise<void> => {
  await api.post<void>(`/organizations/${organizationId}/devices/${deviceId}/enable`, body);
  return;
};

export const removeDeviceFromProject = async (organizationId: OrganizationId, deviceId: DeviceId, projectId: ProjectId): Promise<void> => {
  await api.delete<void>(`/organizations/${organizationId}/devices/${deviceId}/projects/${projectId}`);
  return;
};
