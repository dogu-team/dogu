import { JOB_STATE, ProjectId } from '@dogu-private/types';

export interface Job {
  id: number;
  projectId: ProjectId;
  name: string;
  gitUrl: string;
  state: JOB_STATE;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
