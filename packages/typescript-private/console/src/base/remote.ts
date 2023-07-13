import { ProjectId, RemoteId, REMOTE_TYPE } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RemoteWebDriverInfoBase } from '..';

interface RemoteRelationTraits {
  remoteInfo?: RemoteWebDriverInfoBase | null;
}

export interface RemoteBaseTraits {
  remoteId: RemoteId;
  projectId: ProjectId;
  // runsOn: string;
  type: REMOTE_TYPE;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RemoteBase = RemoteBaseTraits & RemoteRelationTraits;
export const RemotePropCamel = propertiesOf<RemoteBase>();
export const RemotePropSnake = camelToSnakeCasePropertiesOf<RemoteBase>();
