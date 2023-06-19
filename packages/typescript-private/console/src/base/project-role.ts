import { OrganizationId, ProjectRoleId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { OrganizationBase } from '..';
import { TeamBase } from './team';
import { UserBase } from './user';

export interface ProjectRoleRelationTraits {
  users?: UserBase[];
  teams?: TeamBase[];
  organization?: OrganizationBase;
}

export interface ProjectRoleBaseTraits {
  projectRoleId: ProjectRoleId;
  organizationId: OrganizationId | null;
  name: string;
  customise: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectRoleBase = ProjectRoleBaseTraits & ProjectRoleRelationTraits;
export const ProjectRolePropCamel = propertiesOf<ProjectRoleBase>();
export const ProjectRolePropSnake = camelToSnakeCasePropertiesOf<ProjectRoleBase>();
