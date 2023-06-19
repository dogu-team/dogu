import { HostId, ProjectId, RESULT_CODE } from '@dogu-private/types';

export interface Task {
  id: number;
  jobId: number;
  projectId: ProjectId;
  hostId: HostId;
  deviceid: string;
  resultCode: RESULT_CODE;
  resultMsg: string;
  log: string;
  startedAt: Date;
  endedAt: Date;
}
