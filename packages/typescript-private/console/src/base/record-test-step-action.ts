import { RecordTestStepActionId, RecordTestStepId, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordTestStepBase } from './record-test-step';

interface RecordTestStepActionRelationTraits {
  recordTestStep?: RecordTestStepBase;
}

export interface RecordTestStepActionBaseTraits {
  recordTestStepActionId: RecordTestStepActionId;
  recordTestStepId: RecordTestStepId;
  type: RECORD_TEST_STEP_ACTION_TYPE;
  screenshotUrl: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestStepActionBase = RecordTestStepActionBaseTraits & RecordTestStepActionRelationTraits;
export const RecordTestStepActionPropCamel = propertiesOf<RecordTestStepActionBase>();
export const RecordTestStepActionPropSnake = camelToSnakeCasePropertiesOf<RecordTestStepActionBase>();
