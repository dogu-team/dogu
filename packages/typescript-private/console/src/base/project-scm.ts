import { ProjectId, ProjectScmId, PROJECT_SCM_TYPE } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectBase } from './project';

export interface ProjectScmRelationTraits {
  project?: ProjectBase;
}

export interface ProjectScmBaseTraitsBase {
  projectScmId: ProjectScmId;
  projectId: ProjectId;
  type: PROJECT_SCM_TYPE;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
export type ProjectScmBase = ProjectScmBaseTraitsBase & ProjectScmRelationTraits;
export const ProjectScmBasePropCamel = propertiesOf<ProjectScmBase>();
export const ProjectScmBasePropSnake = camelToSnakeCasePropertiesOf<ProjectScmBase>();
