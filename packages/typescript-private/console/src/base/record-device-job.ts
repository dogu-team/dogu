import { DeviceId, RecordDeviceJobId, RecordPipelineId, RECORD_PIPELINE_STATE } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordPipelineBase } from '..';
import { DeviceBase } from './device';

export interface RecordDeviceJobBaseRelationTraits {
  recordPipeline?: RecordPipelineBase;
  device?: DeviceBase;
}

export interface RecordDeviceJobBaseTraits {
  recordDeviceJobId: RecordDeviceJobId;
  recordPipelineId: RecordPipelineId;
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
