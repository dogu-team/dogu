import { ProjectScmGithubAuthId, ProjectScmId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectScmBase } from './project-scm';

export interface ProjectScmGithubAuthRelationTraits {
  projectScm?: ProjectScmBase;
}

export interface ProjectScmGithubAuthBaseTraitsBase {
  projectScmGithubAuthId: ProjectScmGithubAuthId;
  projectScmId: ProjectScmId;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
export type ProjectScmGithubAuthBase = ProjectScmGithubAuthBaseTraitsBase & ProjectScmGithubAuthRelationTraits;
export const ProjectScmGithubAuthPropCamel = propertiesOf<ProjectScmGithubAuthBase>();
export const ProjectScmGithubAuthPropSnake = camelToSnakeCasePropertiesOf<ProjectScmGithubAuthBase>();
