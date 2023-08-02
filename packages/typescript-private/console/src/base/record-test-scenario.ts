import { ProjectId, RecordTestScenarioId, UserId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectBase } from './project';
import { RecordTestCaseBase } from './record-test-case';
import { UserBase } from './user';

interface RecordTestScenarioRelationTraits {
  project?: ProjectBase;
  creator?: UserBase;
  recordTestCases?: RecordTestCaseBase[];
}

export interface RecordTestScenarioBaseTraits {
  recordTestScenarioId: RecordTestScenarioId;
  projectId: ProjectId;
  creatorId: UserId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestScenarioBase = RecordTestScenarioBaseTraits & RecordTestScenarioRelationTraits;
export const RecordTestScenarioPropCamel = propertiesOf<RecordTestScenarioBase>();
export const RecordTestScenarioPropSnake = camelToSnakeCasePropertiesOf<RecordTestScenarioBase>();
