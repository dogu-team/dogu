import api from '.';

export const updateLastSeen = async () => {
  return await api.post<void>('/change-logs/last-seen');
};
