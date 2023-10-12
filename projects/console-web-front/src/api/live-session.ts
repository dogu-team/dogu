import { LiveSessionBase, LiveSessionCreateRequestBodyDto } from '@dogu-private/console';
import api from '.';

export const createLiveTestingSession = async (dto: LiveSessionCreateRequestBodyDto) => {
  const { data } = await api.post<LiveSessionBase>('/live-sessions', dto);
  return data;
};
