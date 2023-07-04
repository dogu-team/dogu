import { GitlabRepositoryAuthId, ProjectRepositoryId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectRepositoryBase } from './project-repository';

export interface GitlabRepositoryAuthRelationTraits {
  projectRepository?: ProjectRepositoryBase;
}

export interface GitlabRepositoryAuthBaseTraitsBase {
  gitlabRepositoryAuthId: GitlabRepositoryAuthId;
  projectRepositoryId: ProjectRepositoryId;
  token: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
export type GitlabRepositoryAuthBase = GitlabRepositoryAuthBaseTraitsBase & GitlabRepositoryAuthRelationTraits;
export const GitlabRepositoryAuthPropCamel = propertiesOf<GitlabRepositoryAuthBase>();
export const GitlabRepositoryAuthPropSnake = camelToSnakeCasePropertiesOf<GitlabRepositoryAuthBase>();
