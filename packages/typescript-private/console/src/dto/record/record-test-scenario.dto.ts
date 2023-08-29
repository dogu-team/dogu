import { RecordTestCaseId } from '@dogu-private/types';
import { RecordTestCaseResponse, RecordTestScenarioAndRecordTestCaseBase, RecordTestScenarioBase } from '../../index';
import { PageDtoBase } from '../pagination/page.dto';

export interface CreateRecordTestScenarioDtoBase extends Pick<RecordTestScenarioBase, 'name'> {
  name: string;
  recordTestCaseIds?: RecordTestCaseId[];
}

export interface FindRecordTestScenariosByProjectIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface UpdateRecordTestScenarioDtoBase extends Pick<RecordTestScenarioBase, 'name'> {
  name: string;
  recordTestCaseIds?: RecordTestCaseId[];
}

export interface RecordTestScenarioResponse extends RecordTestScenarioBase {
  recordTestCases: RecordTestCaseResponse[];
}

export interface AddRecordTestCaseToRecordTestScenarioDtoBase extends Pick<RecordTestScenarioAndRecordTestCaseBase, 'recordTestCaseId' | 'prevRecordTestCaseId'> {}
