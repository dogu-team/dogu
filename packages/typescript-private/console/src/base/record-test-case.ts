import { RecordTestCaseId, RecordTestScenarioId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordTestScenarioBase } from './record-test-scenario';
import { RecordTestStepBase } from './record-test-step';

interface RecordTestCaseRelationTraits {
  prevRecordTestCase?: RecordTestCaseBase | null;
  recordTestScenario?: RecordTestScenarioBase;
  recordTestSteps?: RecordTestStepBase[];
}

export interface RecordTestCaseBaseTraits {
  recordTestCaseId: RecordTestCaseId;
  prevRecordTestCaseId: RecordTestCaseId | null;
  recordTestScenarioId: RecordTestScenarioId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestCaseBase = RecordTestCaseBaseTraits & RecordTestCaseRelationTraits;
export const RecordTestCasePropCamel = propertiesOf<RecordTestCaseBase>();
export const RecordTestCasePropSnake = camelToSnakeCasePropertiesOf<RecordTestCaseBase>();
