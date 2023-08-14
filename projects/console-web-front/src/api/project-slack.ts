import { UpdateProjectSlackRemoteDtoBase, UpdateProjectSlackRoutineDtoBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, RoutineId } from '@dogu-private/types';
import api from '.';

export const getProjectSlackRemote = async (organizationId: OrganizationId, projectId: ProjectId) => {
  const { data } = await api.get(`/organizations/${organizationId}/projects/${projectId}/slack/remote`);
};

export const getProjectSlackRoutine = async (organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId) => {
  const { data } = await api.get(`/organizations/${organizationId}/projects/${projectId}/slack/routine/${routineId}`);
};

export const updateProjectSlackRemote = async (organizationId: OrganizationId, projectId: ProjectId, dto: UpdateProjectSlackRemoteDtoBase) => {
  dto.onSuccess = Number(dto.onSuccess);
  dto.onFailure = Number(dto.onFailure);
  const { data } = await api.put(`/organizations/${organizationId}/projects/${projectId}/slack/remote`, dto);
};

export const updateProjectSlackRoutine = async (organizationId: OrganizationId, projectId: ProjectId, dto: UpdateProjectSlackRoutineDtoBase) => {
  dto.onSuccess = Number(dto.onSuccess);
  dto.onFailure = Number(dto.onFailure);
  const { data } = await api.put(`/organizations/${organizationId}/projects/${projectId}/slack/routine`, dto);
};
