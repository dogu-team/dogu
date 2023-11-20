import { UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import {
  ChangeLogUserReactionBase,
  HostBase,
  ProjectApplicationBase,
  ProjectRoleBase,
  UserAndRefreshTokenBase,
  UserAndResetPasswordTokenBase,
  UserEmailPreferenceBase,
  UserSnsBase,
} from '..';
import { OrganizationBase } from './organization';
import { OrganizationAndUserAndOrganizationRoleBase } from './organization-and-user-and-organization-role';
import { OrganizationUserAndTeamBase } from './organization-and-user-and-team';
import { ProjectBase } from './project';
import { ProjectAndUserAndProjectRoleBase } from './project-and-user-and-project-role';
import { RoutinePipelineBase } from './routine-pipeline';
import { TeamBase } from './team';
import { UserAndInvitationTokenBase } from './user-and-invitation-token';
import { UserAndVerificationTokenBase } from './user-and-verification-token';

export interface UserRelationTraits {
  organizations?: OrganizationBase[];
  organizationAndUserAndOrganizationRoles?: OrganizationAndUserAndOrganizationRoleBase[];
  projects?: ProjectBase[];
  teams?: TeamBase[];
  projectRoles?: ProjectRoleBase[];
  routinePipelines?: RoutinePipelineBase[];
  organizationAndUserAndTeams?: OrganizationUserAndTeamBase[];
  projectAndUserAndProjectRoles?: ProjectAndUserAndProjectRoleBase[];
  userAndVerificationToken?: UserAndVerificationTokenBase;
  userAndInvitationToken?: UserAndInvitationTokenBase;
  userAndResetPasswordToken?: UserAndResetPasswordTokenBase;
  emailPreference?: UserEmailPreferenceBase;
  hosts?: HostBase[];
  userAndRefreshTokens?: UserAndRefreshTokenBase[];
  projectApplications?: ProjectApplicationBase[];
  userSns?: UserSnsBase;
  changeLogReactions?: ChangeLogUserReactionBase[];
}

export interface UserBaseTraits {
  userId: UserId;
  email: string;
  uniqueEmail: string;
  password?: string | null;
  name: string;
  profileImageUrl: string | null;
  isTutorialCompleted: number;
  isRoot: boolean;
  lastChangeLogSeenAt: Date | null;
  lastAccessedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type UserBase = UserBaseTraits & UserRelationTraits;
export const UserPropCamel = propertiesOf<UserBase>();
export const UserPropSnake = camelToSnakeCasePropertiesOf<UserBase>();
