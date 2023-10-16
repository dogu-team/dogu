import { LiveSessionBase, LiveSessionCreateRequestBodyDto } from '@dogu-private/console';
import { LiveSessionId, OrganizationId } from '@dogu-private/types';

import api from '.';

export const createLiveTestingSession = async (dto: LiveSessionCreateRequestBodyDto) => {
  const { data } = await api.post<LiveSessionBase>('/live-sessions', dto);
  return data;
};

export const closeLiveTestingSession = async (sessionId: LiveSessionId, organizationId: OrganizationId) => {
  return await api.delete<void>(`/live-sessions/${sessionId}/${organizationId}`);
};
