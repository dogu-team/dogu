import { RemoteDestPublic } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RemoteDestEdgeBase, RemoteDeviceJobBase } from '../index';

interface RemoteDestPrivateTraits {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
  localInProgressAt: Date | null;
  localCompletedAt: Date | null;
}

interface RemoteDestRelationTraits {
  remoteDeviceJob?: RemoteDeviceJobBase;
  children?: RemoteDestBase[];
  remoteDestEdges?: RemoteDestEdgeBase[];
}

export type RemoteDestBase = RemoteDestPublic & RemoteDestPrivateTraits & RemoteDestRelationTraits;
export const RemoteDestPropCamel = propertiesOf<RemoteDestBase>();
export const RemoteDestPropSnake = camelToSnakeCasePropertiesOf<RemoteDestBase>();
