import { ProjectId, RecordTestScenarioId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordTestScenarioAndRecordTestCaseBase } from '..';
import { ProjectBase } from './project';

interface RecordTestScenarioRelationTraits {
  project?: ProjectBase;
  recordTestScenarioAndRecordTestCases?: RecordTestScenarioAndRecordTestCaseBase[];
}

export interface RecordTestScenarioBaseTraits {
  recordTestScenarioId: RecordTestScenarioId;
  projectId: ProjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestScenarioBase = RecordTestScenarioBaseTraits & RecordTestScenarioRelationTraits;
export const RecordTestScenarioPropCamel = propertiesOf<RecordTestScenarioBase>();
export const RecordTestScenarioPropSnake = camelToSnakeCasePropertiesOf<RecordTestScenarioBase>();
