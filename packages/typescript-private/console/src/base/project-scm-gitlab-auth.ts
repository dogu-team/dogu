import { ProjectScmGitlabAuthId, ProjectScmId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectScmBase } from './project-scm';

export interface ProjectScmGitlabAuthRelationTraits {
  projectScm?: ProjectScmBase;
}

export interface ProjectScmGitlabAuthBaseTraitsBase {
  projectScmGitlabAuthId: ProjectScmGitlabAuthId;
  projectScmId: ProjectScmId;
  token: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
export type ProjectScmGitlabAuthBase = ProjectScmGitlabAuthBaseTraitsBase & ProjectScmGitlabAuthRelationTraits;
export const ProjectScmGitlabAuthPropCamel = propertiesOf<ProjectScmGitlabAuthBase>();
export const ProjectScmGitlabAuthPropSnake = camelToSnakeCasePropertiesOf<ProjectScmGitlabAuthBase>();
