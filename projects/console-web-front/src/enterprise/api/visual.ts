import { CreateRecordTestCaseDtoBase, CreateRecordTestStepDtoBase, NewSessionRecordTestCaseDtoBase, RecordTestCaseBase, RecordTestStepBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, RecordTestCaseId } from '@dogu-private/types';
import api from '../../api';

export const createVisualCase = async (organizaitonId: OrganizationId, projectId: ProjectId, dto: CreateRecordTestCaseDtoBase): Promise<RecordTestCaseBase> => {
  const { data } = await api.post<RecordTestCaseBase>(`/organizations/${organizaitonId}/projects/${projectId}/record-test-cases`, dto);
  return data;
};

export const createNewSession = async (
  organizaitonId: OrganizationId,
  projectId: ProjectId,
  recordTestCaseId: string,
  dto: NewSessionRecordTestCaseDtoBase,
): Promise<RecordTestCaseBase> => {
  const { data } = await api.post<RecordTestCaseBase>(`/organizations/${organizaitonId}/projects/${projectId}/record-test-cases/${recordTestCaseId}/new-session`, dto);
  return data;
};

export const createStep = async (dto: { organizationId: OrganizationId; projectId: ProjectId; recordTestCaseId: RecordTestCaseId } & CreateRecordTestStepDtoBase) => {
  const { organizationId, projectId, recordTestCaseId, ...rest } = dto;
  const { data } = await api.post<RecordTestStepBase>(
    `/organizations/${dto.organizationId}/projects/${dto.projectId}/record-test-cases/${dto.recordTestCaseId}/record-test-steps`,
    rest,
  );
  return data;
};

export const getDeviceKeyboardShown = async (organizationId: OrganizationId, projectId: ProjectId, recordTestCaseId: RecordTestCaseId) => {
  const { data } = await api.get<boolean>(`/organizations/${organizationId}/projects/${projectId}/record-test-cases/${recordTestCaseId}/keyboard`);
  return data;
};
