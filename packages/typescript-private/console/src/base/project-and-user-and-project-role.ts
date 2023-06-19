import { ProjectId, ProjectRoleId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectRoleBase } from '../index';
import { ProjectBase } from './project';
import { UserBase } from './user';

export interface ProjectAndUserAndProjectRoleRelationTraits {
  user?: UserBase;
  project?: ProjectBase;
  projectRole?: ProjectRoleBase;
}
export interface ProjectAndUserAndProjectRoleBaseTraits {
  userId: UserId;
  projectRoleId: ProjectRoleId;
  projectId: ProjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ProjectAndUserAndProjectRoleBase = ProjectAndUserAndProjectRoleBaseTraits & ProjectAndUserAndProjectRoleRelationTraits;
export const ProjectAndUserAndProjectRolePropCamel = propertiesOf<ProjectAndUserAndProjectRoleBase>();
export const ProjectAndUserAndProjectRolePropSnake = camelToSnakeCasePropertiesOf<ProjectAndUserAndProjectRoleBase>();
