import { RecordTestActionType } from '@dogu-private/types';
import { RecordTestStepBase } from '../../index';

export interface RecordTestActionBase {
  type: RecordTestActionType;
}

export interface CreateRecordTestActionWebdriverClickDtoBase {
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
  actionInfo: CreateRecordTestActionWebdriverClickDtoBase | CreateRecordTestActionWebdriverInputDtoBase;
}

export interface RecordTestStepResponse extends RecordTestStepBase {
  screenshotUrl: string;
  pageSourceUrl: string;
}
