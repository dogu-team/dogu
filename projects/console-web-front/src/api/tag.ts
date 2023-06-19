import { CreateDeviceTagDtoBase, DeviceTagBase, UpdateDeviceTagDtoBase } from '@dogu-private/console';
import { DeviceTagId, OrganizationId } from '@dogu-private/types';

import api from '.';

export const createTag = async (organizationId: OrganizationId, body: CreateDeviceTagDtoBase) => {
  const { data } = await api.post<DeviceTagBase>(`/organizations/${organizationId}/tags`, body);

  return data;
};

export const deleteTag = async (organizationId: OrganizationId, tagId: DeviceTagId) => {
  return await api.delete<DeviceTagBase>(`/organizations/${organizationId}/tags/${tagId}`);
};

export const updateTag = async (orgId: OrganizationId, tagId: DeviceTagId, body: UpdateDeviceTagDtoBase) => {
  return await api.patch<DeviceTagBase>(`/organizations/${orgId}/tags/${tagId}`, body);
};

export const getAllTags = async (orgId: OrganizationId) => {
  const { data } = await api.get<DeviceTagBase[]>(`/organizations/${orgId}/tags/all`);

  return data;
};
