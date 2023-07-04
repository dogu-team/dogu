import { GitlabRepositoryAuthId, ProjectRepositoryId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectRepositoryBase } from './project-repository';

export interface GithubRepositoryAuthRelationTraits {
  projectRepository?: ProjectRepositoryBase;
}

export interface GithubRepositoryAuthBaseTraitsBase {
  githubRepositoryAuthId: GitlabRepositoryAuthId;
  projectRepositoryId: ProjectRepositoryId;
  token: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
export type GithubRepositoryAuthBase = GithubRepositoryAuthBaseTraitsBase & GithubRepositoryAuthRelationTraits;
export const GithubRepositoryAuthPropCamel = propertiesOf<GithubRepositoryAuthBase>();
export const GithubRepositoryAuthPropSnake = camelToSnakeCasePropertiesOf<GithubRepositoryAuthBase>();
