import { AcceptUserInvitationDtoBase, UserAndInvitationTokenBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import api from '.';

export const getInvitationServerSide = async (
  email: string,
  organizationId: OrganizationId,
  invitationToken: string,
  userToken: string,
) => {
  const { data } = await api.get<UserAndInvitationTokenBase>(
    `/invitations?email=${email}&organizationId=${organizationId}&token=${invitationToken}`,
    {
      headers: { Authorization: `Bearer ${userToken}` },
    },
  );

  return data;
};

export const acceptInivitation = async (body: AcceptUserInvitationDtoBase) => {
  await api.post<void>(`/invitations/accept`, body);
};
