import { RoutineJob } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RoutineDeviceJobBase } from './routine-device-job';
import { RoutineJobEdgeBase } from './routine-job-edge';
import { RoutinePipelineBase } from './routine-pipeline';

export interface RoutineJobBaseRelationTraits {
  routineJobEdges?: RoutineJobEdgeBase[];
  routineDeviceJobs?: RoutineDeviceJobBase[];
  routinePipeline?: RoutinePipelineBase;
}

export type RoutineJobBase = RoutineJob & RoutineJobBaseRelationTraits;
export const RoutineJobPropCamel = propertiesOf<RoutineJobBase>();
export const RoutineJobPropSnake = camelToSnakeCasePropertiesOf<RoutineJobBase>();

export interface JobElement extends RoutineJobBase {
  children: JobElement[];
}
