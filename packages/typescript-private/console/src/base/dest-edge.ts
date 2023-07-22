import { DestEdge } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DestBase } from './dest';

interface DestEdgeRelationTraits {
  dest?: DestBase;
}

export type DestEdgeBase = DestEdge & DestEdgeRelationTraits;
export const DestJobEdgePropCamel = propertiesOf<DestEdgeBase>();
export const DestJobEdgePropSnake = camelToSnakeCasePropertiesOf<DestEdgeBase>();
