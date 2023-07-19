import { CREATOR_TYPE, ProjectId, RemoteId, REMOTE_TYPE, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RemoteDeviceJobBase, RemoteWebDriverInfoBase, UserBase } from '..';

interface RemoteRelationTraits {
  creator?: UserBase;
  remoteInfo?: RemoteWebDriverInfoBase | null;
  remoteDeviceJobs?: RemoteDeviceJobBase[];
}

export interface RemoteBaseTraits {
  remoteId: RemoteId;
  projectId: ProjectId;
  // runsOn: string;
  type: REMOTE_TYPE;
  creatorId: UserId | null;
  creatorType: CREATOR_TYPE;
  doguOptions: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RemoteBase = RemoteBaseTraits & RemoteRelationTraits;
export const RemotePropCamel = propertiesOf<RemoteBase>();
export const RemotePropSnake = camelToSnakeCasePropertiesOf<RemoteBase>();
