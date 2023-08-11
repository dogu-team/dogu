import { RecordTestCaseId, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { PageDtoBase, RecordTestStepBase } from '../../index';

export interface CreateRecordTestStepDtoBase extends Pick<RecordTestStepBase, 'name'> {
  name: string;
}

export interface FindRecordTestStepsByProjectIdDtoBase extends PageDtoBase {
  keyword?: string;
}

export interface UpdateRecordTestStepDtoBase extends Pick<RecordTestStepBase, 'name'> {
  name: string;
}

export interface AddActionDtoBase {
  recordTestCaseId: RecordTestCaseId;
  deviceId: string;
  type: RECORD_TEST_STEP_ACTION_TYPE;
  screenPositionX?: number;
  screenPositionY?: number;
}

export interface RecordTestStepResponse extends RecordTestStepBase {}
