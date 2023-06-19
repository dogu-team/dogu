import { OrganizationId } from '@dogu-private/types';

export interface AcceptUserInvitationDtoBase {
  email: string;
  organizationId: OrganizationId;
  token: string;
}
