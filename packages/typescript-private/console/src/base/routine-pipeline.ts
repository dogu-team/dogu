import { RoutinePipeline } from '@dogu-private/types';

import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectBase } from './project';
import { RoutineBase } from './routine';
import { RoutineJobBase } from './routine-job';
import { UserBase } from './user';

export interface RoutinePipelineBaseRelationTraits {
  creator?: UserBase | null;
  routine?: RoutineBase | null;
  routineJobs?: RoutineJobBase[];
  canceler?: UserBase;
  project?: ProjectBase;
}

export type RoutinePipelineBase = RoutinePipeline & RoutinePipelineBaseRelationTraits;
export const RoutinePipelinePropCamel = propertiesOf<RoutinePipelineBase>();
export const RoutinePipelinePropSnake = camelToSnakeCasePropertiesOf<RoutinePipelineBase>();
