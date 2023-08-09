import { RecordTestStepActionId, RecordTestStepActionWebdriverClickId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordTestStepActionBase } from './record-test-step-action';

interface RecordTestStepActionWebdriverClickRelationTraits {
  recordTestStepAction?: RecordTestStepActionBase;
}

export interface RecordTestStepActionWebdriverClickBaseTraits {
  recordTestStepActionWebdriverClickId: RecordTestStepActionWebdriverClickId;
  recordTestStepActionId: RecordTestStepActionId;
  xpath: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestStepActionWebdriverClickBase = RecordTestStepActionWebdriverClickBaseTraits & RecordTestStepActionWebdriverClickRelationTraits;
export const RecordTestStepActionWebdriverClickPropCamel = propertiesOf<RecordTestStepActionWebdriverClickBase>();
export const RecordTestStepActionWebdriverClickPropSnake = camelToSnakeCasePropertiesOf<RecordTestStepActionWebdriverClickBase>();
