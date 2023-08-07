import { CreateRecordTestCaseDtoBase, RecordTestCaseBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import api from '../../api';

export const createVisualCase = async (organizaitonId: OrganizationId, projectId: ProjectId, dto: CreateRecordTestCaseDtoBase): Promise<RecordTestCaseBase> => {
  const { data } = await api.post<RecordTestCaseBase>(`/organizations/${organizaitonId}/projects/${projectId}/record-test-cases`, dto);
  return data;
};
