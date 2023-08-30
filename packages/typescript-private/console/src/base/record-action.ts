import { RecordActionId, RecordDeviceJobId, RecordTestStepId, RECORD_PIPELINE_STATE, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordDeviceJobBase } from './record-device-job';
import { RecordTestStepBase } from './record-test-step';

export interface RecordActionBaseRelationTraits {
  recordDeviceJob?: RecordDeviceJobBase;
  recordTestStepAction?: RecordTestStepBase;
}

export interface RecordActionBaseTraits {
  recordActionId: RecordActionId;
  recordDeviceJobId: RecordDeviceJobId;
  index: number;
  state: RECORD_PIPELINE_STATE;
  type: RECORD_TEST_STEP_ACTION_TYPE;
  recordTestStepId: RecordTestStepId;
  actionInfo: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
}

export type RecordActionBase = RecordActionBaseTraits & RecordActionBaseRelationTraits;
export const RecordActionPropCamel = propertiesOf<RecordActionBase>();
export const RecordActionPropSnake = camelToSnakeCasePropertiesOf<RecordActionBase>();
