import { CREATOR_TYPE, ProjectId, RecordPipelineId, RecordTestScenarioId, RECORD_PIPELINE_STATE, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordDeviceJobBase } from './record-device-job';
import { RecordTestScenarioBase } from './record-test-scenario';
import { UserBase } from './user';

export interface RecordPipelineBaseRelationTraits {
  recordTestScenario?: RecordTestScenarioBase;
  recordDeviceJobs?: RecordDeviceJobBase[];
  creator?: UserBase | null;
}

export interface RecordPipelineBaseTraits {
  recordPipelineId: RecordPipelineId;
  projectId: ProjectId;
  recordTestScenarioId: RecordTestScenarioId;
  state: RECORD_PIPELINE_STATE;
  creatorType: CREATOR_TYPE;
  creatorId: UserId | null;
  cancelerId: UserId | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inProgressAt: Date | null;
  completedAt: Date | null;
}

export type RecordPipelineBase = RecordPipelineBaseTraits & RecordPipelineBaseRelationTraits;
export const RecordPipelinePropCamel = propertiesOf<RecordPipelineBase>();
export const RecordPipelinePropSnake = camelToSnakeCasePropertiesOf<RecordPipelineBase>();
