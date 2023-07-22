import { RemoteDestEdge } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RemoteDestBase } from './remote-dest';

interface RemoteDestEdgeRelationTraits {
  remoteDests?: RemoteDestBase[];
}

export type RemoteDestEdgeBase = RemoteDestEdge & RemoteDestEdgeRelationTraits;
export const RemoteDestEdgeBasePropCamel = propertiesOf<RemoteDestEdgeBase>();
export const RemoteDestEdgeBasePropSnake = camelToSnakeCasePropertiesOf<RemoteDestEdgeBase>();
