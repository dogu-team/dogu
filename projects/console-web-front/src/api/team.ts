import { AddTeamUserDtoBase, CreateTeamDtoBase, TeamBase, UpdateTeamDtoBase } from '@dogu-private/console';
import { OrganizationId, TeamId, UserId } from '@dogu-private/types';

import api from '.';

export const createTeam = async (organizationId: OrganizationId, body: CreateTeamDtoBase) => {
  const { data } = await api.post<TeamBase>(`/organizations/${organizationId}/teams`, body);

  return data;
};

export const deleteTeam = async (organizationId: OrganizationId, teamId: TeamId) => {
  return await api.delete(`/organizations/${organizationId}/teams/${teamId}`);
};

export const updateTeam = async (organizationId: OrganizationId, teamId: TeamId, body: UpdateTeamDtoBase) => {
  const { data } = await api.patch<TeamBase>(`/organizations/${organizationId}/teams/${teamId}`, body);

  return data;
};

export const addUserToTeam = async (organizationId: OrganizationId, teamId: TeamId, body: AddTeamUserDtoBase) => {
  return await api.post<void>(`/organizations/${organizationId}/teams/${teamId}/users`, body);
};

export const removeUserFromTeam = async (organizationId: OrganizationId, teamId: TeamId, userId: UserId) => {
  return await api.delete<void>(`/organizations/${organizationId}/teams/${teamId}/users/${userId}`);
};
