import { Routine } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RoutinePipelineBase } from './routine-pipeline';

export interface RoutineBaseRelationTraits {
  routinePipelines?: RoutinePipelineBase[];
}

export type RoutineBase = Routine & RoutineBaseRelationTraits;
export const RoutinePropCamel = propertiesOf<RoutineBase>();
export const RoutinePropSnake = camelToSnakeCasePropertiesOf<RoutineBase>();
