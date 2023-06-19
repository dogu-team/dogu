import api from 'src/api';

import { Task } from 'src/types/task';

export const createTask = async (jobId: number, deviceIds: string[]) => {
  const data = await api.post<Task>('/tasks', {
    jobId,
    deviceIds,
  });

  return data.data;
};
