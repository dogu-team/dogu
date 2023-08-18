import { ProjectId, RecordTestCaseId, RecordTestStepId, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordTestStepActionWebdriverClickBase } from '..';
import { ProjectBase } from './project';
import { RecordTestCaseBase } from './record-test-case';

interface RecordTestStepRelationTraits {
  recordTestCase?: RecordTestCaseBase;
  project?: ProjectBase;
  prevRecordTestStep?: RecordTestStepBase | null;
  recordTestStepAction?: RecordTestStepActionWebdriverClickBase;
}

export interface RecordTestStepBaseTraits {
  recordTestStepId: RecordTestStepId;
  recordTestCaseId: RecordTestCaseId;
  projectId: ProjectId;
  prevRecordTestStepId: RecordTestStepId | null;
  deviceSerial: string;
  type: RECORD_TEST_STEP_ACTION_TYPE;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestStepBase = RecordTestStepBaseTraits & RecordTestStepRelationTraits;
export const RecordTestStepPropCamel = propertiesOf<RecordTestStepBase>();
export const RecordTestStepPropSnake = camelToSnakeCasePropertiesOf<RecordTestStepBase>();
