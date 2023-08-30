import { DeviceId, ProjectId, RecordTestCaseId, RecordTestStepId, RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase } from './device';
import { ProjectBase } from './project';
import { RecordTestCaseBase } from './record-test-case';

interface RecordTestStepRelationTraits {
  recordTestCase?: RecordTestCaseBase;
  project?: ProjectBase;
  device?: DeviceBase;
  prevRecordTestStep?: RecordTestStepBase | null;
}

interface RecordTestStepActionCommmon {
  type: RECORD_TEST_STEP_ACTION_TYPE;
  deviceScreenSizeX: number;
  deviceScreenSizeY: number;
  boundX: number;
  boundY: number;
  boundWidth: number;
  boundHeight: number;
}

export interface RecordTestStepActionClick extends RecordTestStepActionCommmon {
  xpath: string | null;
}

export interface RecordTestStepActionInput extends RecordTestStepActionCommmon {
  xpath: string | null;
  value: string | null;
}

export interface RecordTestStepBaseTraits {
  recordTestStepId: RecordTestStepId;
  recordTestCaseId: RecordTestCaseId;
  projectId: ProjectId;
  prevRecordTestStepId: RecordTestStepId | null;
  deviceId: DeviceId;
  deviceInfo: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestStepBase = RecordTestStepBaseTraits & RecordTestStepRelationTraits & RecordTestStepActionCommmon & RecordTestStepActionClick & RecordTestStepActionInput;
export const RecordTestStepPropCamel = propertiesOf<RecordTestStepBase>();
export const RecordTestStepPropSnake = camelToSnakeCasePropertiesOf<RecordTestStepBase>();
