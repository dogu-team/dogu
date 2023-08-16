import { CreateRecordTestCaseDtoBase, CreateRecordTestStepDtoBase, NewSessionRecordTestCaseDtoBase, PageBase, RecordTestCaseBase, RecordTestStepBase } from '@dogu-private/console';
import { OrganizationId, ProjectId, RecordTestCaseId } from '@dogu-private/types';
import { GetServerSidePropsContext } from 'next';
import api from '../../api/index';
import { EmptyTokenError, getServersideCookies, setCookiesInServerSide } from '../../utils/auth';

export const createRecordTestCase = async (organizaitonId: OrganizationId, projectId: ProjectId, dto: CreateRecordTestCaseDtoBase): Promise<RecordTestCaseBase> => {
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

export const createRecordTestStep = async (dto: { organizationId: OrganizationId; projectId: ProjectId; recordTestCaseId: RecordTestCaseId } & CreateRecordTestStepDtoBase) => {
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

export const deleteRecordTestStep = async (dto: { organizationId: OrganizationId; projectId: ProjectId; recordTestCaseId: RecordTestCaseId; recordTestStepId: string }) => {
  const { organizationId, projectId, recordTestCaseId, recordTestStepId } = dto;
  await api.delete<void>(`/organizations/${organizationId}/projects/${projectId}/record-test-cases/${recordTestCaseId}/record-test-steps/${recordTestStepId}`);
};

export const getTestCasesInServerSide = async (context: GetServerSidePropsContext) => {
  const { authToken } = getServersideCookies(context.req.cookies);

  if (authToken) {
    const page = context.query.page ? Number(context.query.page) : 1;
    const data = await api.get<PageBase<RecordTestCaseBase>>(`/organizations/${context.query.orgId}/projects/${context.query.pid}/record-test-cases?page=${page || 1}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    setCookiesInServerSide(data, context);
    return data.data;
  }

  throw new EmptyTokenError();
};
