import { RecordCaseActionId, RecordDeviceJobId, RecordTestCaseId, RECORD_PIPELINE_STATE } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordDeviceJobBase } from './record-device-job';
import { RecordStepActionBase } from './record-step-action';
import { RecordTestCaseBase } from './record-test-case';

export interface RecordCaseActionBaseRelationTraits {
  recordDeviceJob?: RecordDeviceJobBase;
  recordTestCase?: RecordTestCaseBase;
  // recordTestSteps?: RecordStepActionBase[];
  recordStepActions?: RecordStepActionBase[];
}

export interface RecordCaseActionBaseTraits {
  recordCaseActionId: RecordCaseActionId;
  recordDeviceJobId: RecordDeviceJobId;
  index: number;
  state: RECORD_PIPELINE_STATE;
  recordTestCaseInfo: Record<string, unknown>;
  recordTestCaseId: RecordTestCaseId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
}

export type RecordCaseActionBase = RecordCaseActionBaseTraits & RecordCaseActionBaseRelationTraits;
export const RecordCaseActionPropCamel = propertiesOf<RecordCaseActionBase>();
export const RecordCaseActionPropSnake = camelToSnakeCasePropertiesOf<RecordCaseActionBase>();
