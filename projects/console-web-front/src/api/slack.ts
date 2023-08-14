import { ConnectSlackDtoBase } from '@dogu-private/console';
import { OrganizationId, SlackChannelItem } from '@dogu-private/types';

import api from '.';

export const connectSlack = async (orgId: OrganizationId, dto: ConnectSlackDtoBase) => {
  const { data } = await api.post<string>(`/organizations/${orgId}/slack/connect`, dto);

  return data;
};

export const disconnectSlack = async (orgId: OrganizationId) => {
  const { data } = await api.delete<string>(`/organizations/${orgId}/slack/disconnect`);

  return data;
};

export const getSlackChannels = async (orgId: OrganizationId) => {
  const { data } = await api.get<SlackChannelItem[]>(`/organizations/${orgId}/slack/channels`);

  return data;
};
