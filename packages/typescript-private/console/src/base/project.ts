import { OrganizationId, ProjectId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectAndDeviceBase, ProjectScmBase, ProjectSlackRemoteBase, ProjectSlackRoutineBase, RoutineBase } from '..';
import { DeviceBase } from './device';
import { MemberAndRoleGroupBase, MemberBase } from './member';
import { OrganizationBase } from './organization';
import { ProjectAndTeamAndProjectRoleBase } from './project-and-team-and-project-role';
import { ProjectAndUserAndProjectRoleBase } from './project-and-user-and-project-role';
import { TeamBase } from './team';
import { UserBase } from './user';

export interface ProjectRelationTraits {
  organization?: OrganizationBase;
  devices?: DeviceBase[];
  users?: UserBase[];
  teams?: TeamBase[];
  projectAndTeamAndProjectRoles?: ProjectAndTeamAndProjectRoleBase[];
  projectAndUserAndProjectRoles?: ProjectAndUserAndProjectRoleBase[];
  projectAndDevices?: ProjectAndDeviceBase[];
  routines?: RoutineBase[];
  projectScms?: ProjectScmBase[];
  projectSlackRemote?: ProjectSlackRemoteBase[];
  projectSlackRoutine?: ProjectSlackRoutineBase[];
}
interface ProjectResponseTraits {
  members?: MemberBase[];
}

export interface ProjectBaseTraits {
  projectId: ProjectId;
  name: string;
  description: string;
  managedBy: UserId;
  organizationId: OrganizationId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ProjectBase = ProjectBaseTraits & ProjectRelationTraits & ProjectResponseTraits;
export const ProjectPropCamel = propertiesOf<ProjectBase>();
export const ProjectPropSnake = camelToSnakeCasePropertiesOf<ProjectBase>();

export interface ProjectPipelineReportResponse {
  runtime: number;
  total: number;
  successes: number;
  failures: number;
}

export function instanceOfUserAndRoleGroupBase(member: MemberAndRoleGroupBase): member is ProjectAndUserAndProjectRoleBase {
  return 'userId' in member;
}

export function instanceOfTeamAndRoleGroupBase(member: MemberAndRoleGroupBase): member is ProjectAndTeamAndProjectRoleBase {
  return 'teamId' in member;
}

export function instanceOfUserBase(member: MemberBase): member is UserBase {
  return 'userId' in member;
}

export function instanceOfTeamBase(member: MemberBase): member is TeamBase {
  return 'teamId' in member;
}
