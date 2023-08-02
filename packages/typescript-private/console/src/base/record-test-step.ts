import { RecordTestCaseId, RecordTestStepId, TEST_STEP_TYPE } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordTestCaseBase } from './record-test-case';

interface RecordTestStepRelationTraits {
  prevRecordTestStep?: RecordTestStepBase | null;
  recordTestCase?: RecordTestCaseBase;
}

export interface RecordTestStepBaseTraits {
  recordTestStepId: RecordTestStepId;
  prevRecordTestStepId: RecordTestStepId | null;
  recordTestCaseId: RecordTestCaseId;
  name: string;
  type: TEST_STEP_TYPE;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestStepBase = RecordTestStepBaseTraits & RecordTestStepRelationTraits;
export const RecordTestStepPropCamel = propertiesOf<RecordTestStepBase>();
export const RecordTestStepPropSnake = camelToSnakeCasePropertiesOf<RecordTestStepBase>();
