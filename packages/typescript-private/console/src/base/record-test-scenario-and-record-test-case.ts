import { RecordTestCaseId, RecordTestScenarioId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordTestScenarioBase } from '..';
import { RecordTestCaseBase } from './record-test-case';

interface RecordTestScenarioAndRecordTestCaseRelationTraits {
  recordTestScenario?: RecordTestScenarioBase;
  recordTestCase?: RecordTestCaseBase;
  prevRecordTestCase?: RecordTestCaseBase | null;
}

export interface RecordTestScenarioAndRecordTestCaseBaseTraits {
  recordTestScenarioId: RecordTestScenarioId;
  recordTestCaseId: RecordTestCaseId;
  prevRecordTestCaseId: RecordTestCaseId | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestScenarioAndRecordTestCaseBase = RecordTestScenarioAndRecordTestCaseBaseTraits & RecordTestScenarioAndRecordTestCaseRelationTraits;
export const RecordTestScenarioAndRecordTestCasePropCamel = propertiesOf<RecordTestScenarioAndRecordTestCaseBase>();
export const RecordTestScenarioAndRecordTestCasePropSnake = camelToSnakeCasePropertiesOf<RecordTestScenarioAndRecordTestCaseBase>();
