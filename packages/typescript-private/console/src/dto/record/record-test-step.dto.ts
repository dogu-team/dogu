import { RecordTestActionType, RecordTestStepId } from '@dogu-private/types';
import { RecordTestStepActionWebdriverClickBase, RecordTestStepBase } from '../../index';

export interface RecordTestActionBase {
  type: RecordTestActionType;
}

export interface CreateRecordTestActionWebdriverClickDtoBase
  extends Pick<RecordTestStepActionWebdriverClickBase, 'videoScreenSizeX' | 'videoScreenSizeY' | 'videoScreenPositionX' | 'videoScreenPositionY'> {
  type: 'WEBDRIVER_CLICK';
  videoScreenPositionX: number;
  videoScreenPositionY: number;
  videoScreenSizeX: number;
  videoScreenSizeY: number;
}

export interface CreateRecordTestActionWebdriverInputDtoBase extends RecordTestActionBase {
  type: 'WEBDRIVER_INPUT';
  value: string;
}

export interface CreateRecordTestStepDtoBase extends Pick<RecordTestStepBase, 'prevRecordTestStepId'> {
  prevRecordTestStepId: RecordTestStepId | null;
  // deviceId: DeviceId;
  // // type: RECORD_TEST_STEP_ACTION_TYPE;
  actionInfo: CreateRecordTestActionWebdriverClickDtoBase | CreateRecordTestActionWebdriverInputDtoBase;
}
