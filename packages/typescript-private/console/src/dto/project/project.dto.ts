import { DeviceConnectionState, ProjectRoleId, PROJECT_TYPE, TeamId, UserId } from '@dogu-private/types';
import { PageDtoBase } from '../pagination/page.dto';

// project dto start
export interface CreateProjectDtoBase {
  name: string;
  type?: PROJECT_TYPE; // FIXME:(felix) type should be not empty
  description?: string;
}

export interface FindProjectDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface UpdateProjectDtoBase {
  name: string;
  type?: PROJECT_TYPE; // FIXME:(felix) type should be not empty
  description?: string;
}
// project dto end

export interface FindProjectDeviceDtoBase extends PageDtoBase {
  keyword?: string;
  connectionState?: DeviceConnectionState;
}

// project - user - roleGroup dto start
export interface AddUserToProjectDtoBase {
  userId: UserId;
  projectRoleId: ProjectRoleId;
}

export interface FindUsersByProjectIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface UpdateUserProjectRoleDtoBase {
  projectRoleId: ProjectRoleId;
}

// project - user - roleGroup dto end

// project - team - roleGroup dto start
export interface AddTeamToProjectDtoBase {
  teamId: TeamId;
  projectRoleId: ProjectRoleId;
}

export interface FindTeamsByProjectIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface UpdateTeamProjectRoleDtoBase {
  projectRoleId: ProjectRoleId;
}
// project - team - roleGroup dto end

export interface FindMembersByProjectIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface CreatePipelineReportDtoBase {
  from: string;
  to?: string;
}
