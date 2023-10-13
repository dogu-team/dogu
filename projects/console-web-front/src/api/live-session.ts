import { LiveSessionBase, LiveSessionCreateRequestBodyDto } from '@dogu-private/console';
import { LiveSessionId, OrganizationId } from '@dogu-private/types';

import api from '.';

export const createLiveTestingSession = async (dto: LiveSessionCreateRequestBodyDto) => {
  const { data } = await api.post<LiveSessionBase>('/live-sessions', dto);
  return data;
};

export const closeLiveTestingSession = async (sessionId: LiveSessionId, organizationId: OrganizationId) => {
  await api.delete(`/live-sessions/${sessionId}/${organizationId}`);
};
