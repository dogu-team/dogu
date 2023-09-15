import { UploadSampleAppDtoBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { AxiosProgressEvent } from 'axios';

import api from '.';

export const uploadProjectApplication = async (
  organizationId: OrganizationId,
  projectId: ProjectId,
  file: File,
  progress?: (e: AxiosProgressEvent) => void,
) => {
  const fd = new FormData();
  fd.append('file', file);

  await api.put<void>(`/organizations/${organizationId}/projects/${projectId}/applications`, fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: progress,
  });
};

export const getProjectApplicationDownloadUrl = async (
  organizationId: OrganizationId,
  projectId: ProjectId,
  id: number,
) => {
  const { data } = await api.get<string>(
    `/organizations/${organizationId}/projects/${projectId}/applications/${id}/url`,
  );

  return data;
};

export const deleteProjectApplication = async (organizationId: OrganizationId, projectId: ProjectId, id: number) => {
  await api.delete<void>(`/organizations/${organizationId}/projects/${projectId}/applications/${id}`);
};

export const uploadSampleApplication = async (
  organizationId: OrganizationId,
  projectId: ProjectId,
  dto: UploadSampleAppDtoBase,
) => {
  await api.put<void>(`/organizations/${organizationId}/projects/${projectId}/applications/samples`, dto);
};
