import { UploadSampleAppDtoBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { AxiosProgressEvent } from 'axios';

import api from '.';

export const uploadOrganizationApplication = async (
  organizationId: OrganizationId,
  file: File,
  progress?: (e: AxiosProgressEvent) => void,
) => {
  const formData = new FormData();
  formData.append('file', file);

  await api.put<void>(`/organizations/${organizationId}/applications`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: progress,
  });
};

export const getOrganizationApplicationDownloadUrl = async (organizationId: OrganizationId, id: string) => {
  const { data } = await api.get<string>(`/organizations/${organizationId}/applications/${id}/url`);

  return data;
};

export const deleteOrganizationApplicationByPackageName = async (
  organizationId: OrganizationId,
  packageName: string,
) => {
  await api.delete<void>(`/organizations/${organizationId}/applications/packages/${packageName}`);
};

export const deleteOrganizationApplication = async (organizationId: OrganizationId, id: string) => {
  await api.delete<void>(`/organizations/${organizationId}/applications/${id}`);
};

export const uploadSampleApplication = async (organizationId: OrganizationId, dto: UploadSampleAppDtoBase) => {
  await api.put<void>(`/organizations/${organizationId}applications/samples`, dto);
};
