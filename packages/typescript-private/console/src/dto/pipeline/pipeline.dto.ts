import { PIPELINE_STATUS, RoutineId } from '@dogu-private/types';

export interface CreateInstantPipelineDtoBase {
  scriptPath: string;
  appVersion?: string;
  deviceName: string;
}

export interface UpdatePipelineDtoBase {
  status: PIPELINE_STATUS;
}

export interface FindAllPipelinesDtoBase {
  routine?: RoutineId;
  status?: PIPELINE_STATUS[];
}
