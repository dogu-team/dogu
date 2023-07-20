import { ProjectAccessTokenId, ProjectId, TokenId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectBase } from './project';
import { TokenBase } from './token';
import { UserBase } from './user';

export interface ProjectAccessTokenRelationTraits {
  creator?: UserBase;
  revoker?: UserBase;
  project?: ProjectBase;
  token?: TokenBase;
}

export interface ProjectAccessTokenBaseTraits {
  projectAccessTokenId: ProjectAccessTokenId;
  projectId: ProjectId;
  tokenId: TokenId;
  creatorId: UserId | null;
  revokerId: UserId | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ProjectAccessTokenBase = ProjectAccessTokenBaseTraits & ProjectAccessTokenRelationTraits;
export const ProjectAccessTokenPropCamel = propertiesOf<ProjectAccessTokenBase>();
export const ProjectAccessTokenPropSnake = camelToSnakeCasePropertiesOf<ProjectAccessTokenBase>();
