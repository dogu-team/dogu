import { ProjectId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { GitlabGroupId, GitlabProjectId, GitlabProjectToken } from './gitlab';

export interface ProjectGitlabBase {
  projectId: ProjectId;
  gitlabGroupId: GitlabGroupId;
  gitlabProjectId: GitlabProjectId;
  gitlabProjectToken: GitlabProjectToken;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const ProjectGitlabPropCamel = propertiesOf<ProjectGitlabBase>();
export const ProjectGitlabPropSnake = camelToSnakeCasePropertiesOf<ProjectGitlabBase>();
