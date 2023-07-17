import { OrganizationRoleId, UserId, USER_INVITATION_STATUS } from '@dogu-private/types';
import { PageDtoBase } from '../pagination/page.dto';

export interface CreateTeamDtoBase {
  name: string;
}

export interface UpdateTeamDtoBase {
  name: string;
}
export interface FindTeamsDtoBase extends PageDtoBase {
  keyword: string;
}

export interface AddTeamUserDtoBase {
  userId: UserId;
}

export interface InviteEmailDtoBase {
  email: string;
  organizationRoleId: OrganizationRoleId;
}

export interface FindInvitationsDtoBase {
  status: USER_INVITATION_STATUS;
}

export interface UpdateTutorialDtoBase {
  isTutorialCompleted: number;
}
