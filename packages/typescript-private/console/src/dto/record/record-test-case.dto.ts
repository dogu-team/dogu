import { DeviceId, RecordTestStepId } from '@dogu-private/types';
import { PageDtoBase, RecordTestCaseAndRecordTestStepBase, RecordTestCaseBase } from '../../index';
import { RecordTestStepResponse } from './record-test-step.dto';

export interface CreateRecordTestCaseDtoBase extends Pick<RecordTestCaseBase, 'name'> {
  name: string;
}

export interface FindRecordTestCasesByProjectIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface UpdateRecordTestCaseDtoBase extends Pick<RecordTestCaseBase, 'name'> {
  name: string;
}

export interface RecordTestCaseResponse extends RecordTestCaseBase {
  recordTestSteps: RecordTestStepResponse[];
}

export interface AddRecordTestStepToRecordTestCaseDtoBase extends Pick<RecordTestCaseAndRecordTestStepBase, 'recordTestStepId' | 'prevRecordTestStepId'> {
  recordTestStepId: RecordTestStepId;
  prevRecordTestStepId: RecordTestStepId | null;
}

export interface NewSessionDtoBase {
  appVersion?: string;
  browerName?: string;
  browserVersion?: string;
  deviceId: DeviceId;
}
