import { RecordTestCaseId, RecordTestStepId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordTestStepBase } from '../index';
import { RecordTestCaseBase } from './record-test-case';

interface RecordTestCaseAndRecordTestStepRelationTraits {
  recordTestCase?: RecordTestCaseBase;
  recordTestStep?: RecordTestStepBase;
  prevRecordTestStep?: RecordTestStepBase | null;
}

export interface RecordTestCaseAndRecordTestStepBaseTraits {
  recordTestCaseId: RecordTestCaseId;
  recordTestStepId: RecordTestStepId;
  prevRecordTestStepId: RecordTestStepId | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestCaseAndRecordTestStepBase = RecordTestCaseAndRecordTestStepBaseTraits & RecordTestCaseAndRecordTestStepRelationTraits;
export const RecordTestCaseAndRecordTestStepPropCamel = propertiesOf<RecordTestCaseAndRecordTestStepBase>();
export const RecordTestCaseAndRecordTestStepPropSnake = camelToSnakeCasePropertiesOf<RecordTestCaseAndRecordTestStepBase>();
