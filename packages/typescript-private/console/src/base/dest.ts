import { DestPublic } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RoutineStepBase } from '..';
import { DestEdgeBase } from './dest-edge';

interface DestPrivateTraits {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
  localInProgressAt: Date | null;
  localCompletedAt: Date | null;
}

interface DestRelationTraits {
  routineStep?: RoutineStepBase;
  children?: DestBase[];
  destEdges?: DestEdgeBase[];
}

export type DestBase = DestPublic & DestPrivateTraits & DestRelationTraits;
export const DestPropCamel = propertiesOf<DestBase>();
export const DestPropSnake = camelToSnakeCasePropertiesOf<DestBase>();
