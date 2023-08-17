import { CreateHostDtoBase, HostBase, PageBase, UpdateHostNameDtoBase } from '@dogu-private/console';
import { DownloadablePackageResult, HostId, OrganizationId } from '@dogu-private/types';

import api from 'src/api';

export const createHost = async (organizationId: OrganizationId, createHostBody: CreateHostDtoBase) => {
  const result = await api.post<HostBase>(`/organizations/${organizationId}/hosts`, createHostBody);

  return result.data;
};

export const deleteHost = async (organizationId: OrganizationId, hostId: HostId) => {
  return await api.delete(`/organizations/${organizationId}/hosts/${hostId}`);
};

export const getHostConnectionToken = async (organizationId: OrganizationId, hostId: HostId) => {
  const { data } = await api.get<string>(`/organizations/${organizationId}/hosts/${hostId}/token`);

  return data;
};

export const reissuesHostConnectionToken = async (organizationId: OrganizationId, hostId: HostId) => {
  const { data } = await api.post<string>(`/organizations/${organizationId}/hosts/${hostId}/token/reissue`);

  return data;
};

export const updateHostName = async (organizationId: OrganizationId, hostId: HostId, updateHostNameBody: UpdateHostNameDtoBase) => {
  const { data } = await api.patch<HostBase>(`/organizations/${organizationId}/hosts/${hostId}`, updateHostNameBody);

  return data;
};

export const updateUseHostAsDevice = async (organizationId: OrganizationId, hostId: HostId) => {
  const { data } = await api.post<void>(`/organizations/${organizationId}/hosts/${hostId}/usage-device`);

  return data;
};

export const stopUsingHostAsDevice = async (organizationId: OrganizationId, hostId: HostId) => {
  const { data } = await api.delete<void>(`/organizations/${organizationId}/hosts/${hostId}/usage-device`);

  return data;
};

export const getHostByToken = async (organizationId: OrganizationId, token: string) => {
  const { data } = await api.get<PageBase<HostBase>>(`/organizations/${organizationId}/hosts?token=${token}`);

  if (data.items.length === 0) {
    throw new Error('Host not found');
  }

  return data.items[0];
};

export const updateHostApp = async (organizationId: OrganizationId, hostId: HostId) => {
  const { data } = await api.patch<void>(`/organizations/${organizationId}/hosts/${hostId}/app`);

  return data;
};

export const getAgentLatestVersion = async () => {
  const { data } = await api.get<DownloadablePackageResult[]>(`/downloads/dogu-agent/latest`);
  return data;
};
