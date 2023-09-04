import { DeviceId, DeviceRunnerId, RecordDeviceJobId, RecordPipelineId, RECORD_PIPELINE_STATE, WebDriverSessionId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceRunnerBase, RecordCaseActionBase, RecordPipelineBase } from '..';
import { DeviceBase } from './device';

export interface RecordDeviceJobBaseRelationTraits {
  recordPipeline?: RecordPipelineBase;
  device?: DeviceBase;
  recordCaseActions?: RecordCaseActionBase[];
  deviceRunner?: DeviceRunnerBase;
}

export interface RecordDeviceJobBaseTraits {
  recordDeviceJobId: RecordDeviceJobId;
  recordPipelineId: RecordPipelineId;
  sessionId: WebDriverSessionId | null;
  deviceRunnerId: DeviceRunnerId | null;
  state: RECORD_PIPELINE_STATE;
  deviceId: DeviceId;
  deviceInfo: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
}

export type RecordDeviceJobBase = RecordDeviceJobBaseTraits & RecordDeviceJobBaseRelationTraits;
export const RecordDeviceJobPropCamel = propertiesOf<RecordDeviceJobBase>();
export const RecordDeviceJobPropSnake = camelToSnakeCasePropertiesOf<RecordDeviceJobBase>();
