import { RoutineJobId as routineJobId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RoutineJobBase } from './routine-job';

export interface RoutineJobEdgeRelationTraits {
  routineJob?: RoutineJobBase;
  parentRoutineJob?: RoutineJobBase;
}
export interface RoutineJobEdgeBaseTraits {
  routineJobId: routineJobId;
  parentRoutineJobId: routineJobId;
  createdAt: Date;
  deletedAt?: Date | null;
}

export type RoutineJobEdgeBase = RoutineJobEdgeBaseTraits & RoutineJobEdgeRelationTraits;
export const RoutineJobEdgePropCamel = propertiesOf<RoutineJobEdgeBase>();
export const RoutineJobEdgePropSnake = camelToSnakeCasePropertiesOf<RoutineJobEdgeBase>();
