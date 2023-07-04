import { ProjectId, ProjectRepositoryId, REPOSITORY_TYPE } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectBase } from './project';

export interface ProjectRepositoryRelationTraits {
  project?: ProjectBase;
}

export interface ProjectRepositoryBaseTraitsBase {
  projectRepositoryId: ProjectRepositoryId;
  projectId: ProjectId;
  repositoryType: REPOSITORY_TYPE;
  repositoryUrl: string;
  configFilePath: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
export type ProjectRepositoryBase = ProjectRepositoryBaseTraitsBase & ProjectRepositoryRelationTraits;
export const ProjectRepositoryBasePropCamel = propertiesOf<ProjectRepositoryBase>();
export const ProjectRepositoryBasePropSnake = camelToSnakeCasePropertiesOf<ProjectRepositoryBase>();
