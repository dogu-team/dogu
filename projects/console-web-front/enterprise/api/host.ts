import { DownloadablePackageResult, HostId, OrganizationId } from '@dogu-private/types';
import api from '../../src/api/index';

export const updateHostApp = async (organizationId: OrganizationId, hostId: HostId) => {
  const { data } = await api.patch<void>(`/organizations/${organizationId}/hosts/${hostId}/app`);

  return data;
};

export const getAgentLatestVersion = async () => {
  const { data } = await api.get<DownloadablePackageResult[]>(`/downloads/dogu-agent/latest`);
  return data;
};
