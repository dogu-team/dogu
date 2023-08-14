import { ProjectId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectBase } from './project';

export interface ProjectSlackRemoteBaseTrait {
  projectId: ProjectId;
  channelId: string;
  onSuccess: number;
  onFailure: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ProjectSlackRemoteRelationTraits {
  project?: ProjectBase;
}

export type ProjectSlackRemoteBase = ProjectSlackRemoteBaseTrait & ProjectSlackRemoteRelationTraits;
export const ProjectSlackRemotePropCamel = propertiesOf<ProjectSlackRemoteBaseTrait>();
export const ProjectSlackRemotePropSnake = camelToSnakeCasePropertiesOf<ProjectSlackRemoteBase>();
