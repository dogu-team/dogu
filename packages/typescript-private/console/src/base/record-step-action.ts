import { RecordCaseActionId, RecordStepActionId, RecordTestStepId, RECORD_PIPELINE_STATE, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordCaseActionBase } from './record-case-action';
import { RecordTestStepBase } from './record-test-step';

export interface RecordStepActionBaseRelationTraits {
  recordTestStep?: RecordTestStepBase;
  recordCaseAction?: RecordCaseActionBase;
}

export interface RecordStepActionBaseTraits {
  recordStepActionId: RecordStepActionId;
  recordCaseActionId: RecordCaseActionId;
  index: number;
  state: RECORD_PIPELINE_STATE;
  type: RECORD_TEST_STEP_ACTION_TYPE;
  recordTestStepId: RecordTestStepId;
  recordTestStepInfo: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
}

export type RecordStepActionBase = RecordStepActionBaseTraits & RecordStepActionBaseRelationTraits;
export const RecordStepActionPropCamel = propertiesOf<RecordStepActionBase>();
export const RecordStepActionPropSnake = camelToSnakeCasePropertiesOf<RecordStepActionBase>();
