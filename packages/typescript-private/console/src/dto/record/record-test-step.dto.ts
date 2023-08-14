import { RecordTestActionType } from '@dogu-private/types';
import { RecordTestStepActionWebdriverClickBase, RecordTestStepBase } from '../../index';

export interface RecordTestActionBase {
  type: RecordTestActionType;
}

export interface CreateRecordTestActionWebdriverClickDtoBase
  extends Pick<RecordTestStepActionWebdriverClickBase, 'videoScreenSizeX' | 'videoScreenSizeY' | 'videoScreenPositionX' | 'videoScreenPositionY'> {
  type: 'WEBDRIVER_CLICK';
}

export interface CreateRecordTestActionWebdriverInputDtoBase extends RecordTestActionBase {
  type: 'WEBDRIVER_INPUT';
  value: string;
}

export interface CreateRecordTestStepDtoBase extends Pick<RecordTestStepBase, 'prevRecordTestStepId'> {
  actionInfo: CreateRecordTestActionWebdriverClickDtoBase | CreateRecordTestActionWebdriverInputDtoBase;
}
