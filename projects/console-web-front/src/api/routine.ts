import { CreateInstantPipelineDtoBase, RoutineBase, RoutinePipelineBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, RoutineId, RoutinePipelineId } from '@dogu-private/types';

import api from '.';

export const readRoutine = async (organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId) => {
  const { data } = await api.get<string>(
    `/organizations/${organizationId}/projects/${projectId}/routines/${routineId}`,
  );
};

export const createRoutine = async (organizationId: OrganizationId, projectId: ProjectId, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<RoutineBase>(
    `/organizations/${organizationId}/projects/${projectId}/routines`,
    formData,
    {
      headers: {
        'Content-type': 'multipart/form-data',
      },
    },
  );

  return data;
};

export const updateRoutine = async (
  organizationId: OrganizationId,
  projectId: ProjectId,
  routineId: RoutineId,
  file: File,
) => {
  const formData = new FormData();
  formData.append('file', file);

  await api.patch<void>(`/organizations/${organizationId}/projects/${projectId}/routines/${routineId}`, formData, {
    headers: {
      'Content-type': 'multipart/form-data',
    },
  });
};

export const deleteRoutine = async (organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId) => {
  return await api.delete<void>(`/organizations/${organizationId}/projects/${projectId}/routines/${routineId}`);
};

export const createPipeline = async (organizationId: OrganizationId, projectId: ProjectId, routineId: RoutineId) => {
  return await api.post<void>(`/organizations/${organizationId}/projects/${projectId}/routines/${routineId}/pipelines`);
};

export const cancelPipeline = async (
  organizationId: OrganizationId,
  projectId: ProjectId,
  pipelineId: RoutinePipelineId,
) => {
  return await api.post<void>(`/organizations/${organizationId}/projects/${projectId}/pipelines/${pipelineId}/cancel`);
};

export const runInstantTest = async (
  organizationId: OrganizationId,
  projectId: ProjectId,
  dto: CreateInstantPipelineDtoBase,
) => {
  const { data } = await api.post<RoutinePipelineBase>(
    `/organizations/${organizationId}/projects/${projectId}/pipelines/instant`,
    dto,
  );

  return data;
};
