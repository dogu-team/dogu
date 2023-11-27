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
