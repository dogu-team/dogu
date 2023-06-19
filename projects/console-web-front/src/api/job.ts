import { ProjectId } from '@dogu-private/types';

import api from 'src/api';
import { Job } from 'src/types/job';

export const createJob = async (name: string, description: string, gitUrl: string, projectId: ProjectId) => {
  const data = await api.post<Job>('/jobs', {
    name,
    description: description || null,
    gitUrl,
    projectId,
  });

  return data.data;
};
