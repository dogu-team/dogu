import { RecordTestStepId, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { RecordTestStepBase } from '../../index';

export interface CreateRecordTestStepDtoBase extends Pick<RecordTestStepBase, 'prevRecordTestStepId' | 'type'> {
  prevRecordTestStepId: RecordTestStepId | null;
  deviceId: string;
  type: RECORD_TEST_STEP_ACTION_TYPE;
  screenPositionX?: number;
  screenPositionY?: number;
  screenSizeX?: number;
  screenSizeY?: number;
}

// export interface UpdateRecordTestStepDtoBase extends Pick<RecordTestStepBase, 'prevRecordTestStepId'> {
//   name: string;
// }
