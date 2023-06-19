import { ProjectId, ProjectRoleId, TeamId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectBase } from './project';
import { ProjectRoleBase } from './project-role';
import { TeamBase } from './team';

export interface ProjectAndTeamAndProjectRoleRelationTraits {
  team?: TeamBase;
  projectRole?: ProjectRoleBase;
  project?: ProjectBase;
}
export interface ProjectAndTeamAndProjectRoleBaseTraits {
  teamId: TeamId;
  projectRoleId: ProjectRoleId;
  projectId: ProjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ProjectAndTeamAndProjectRoleBase = ProjectAndTeamAndProjectRoleBaseTraits & ProjectAndTeamAndProjectRoleRelationTraits;
export const ProjectAndTeamAndProjectRolePropCamel = propertiesOf<ProjectAndTeamAndProjectRoleBase>();
export const ProjectAndTeamAndProjectRolePropSnake = camelToSnakeCasePropertiesOf<ProjectAndTeamAndProjectRoleBase>();
