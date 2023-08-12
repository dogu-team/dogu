import { UpdateReactionToChangeLogDtoBase } from '@dogu-private/console';
import { ChangeLogId } from '@dogu-private/types';
import api from '.';

export const updateLastSeen = async () => {
  return await api.post<void>('/change-logs/last-seen');
};

export const updateReaction = async (changeLogId: ChangeLogId, dto: UpdateReactionToChangeLogDtoBase) => {
  return await api.patch<void>(`/change-logs/${changeLogId}/reaction`, dto);
};

export const deleteReaction = async (changeLogId: ChangeLogId) => {
  return await api.delete<void>(`/change-logs/${changeLogId}/reaction`);
};
