import { ProjectId, RecordTestScenarioId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordPipelineBase, RecordTestScenarioAndRecordTestCaseBase } from '..';
import { ProjectBase } from './project';

interface RecordTestScenarioRelationTraits {
  project?: ProjectBase;
  recordTestScenarioAndRecordTestCases?: RecordTestScenarioAndRecordTestCaseBase[];
  recordPipelines?: RecordPipelineBase[];
}

export interface RecordTestScenarioBaseTraits {
  recordTestScenarioId: RecordTestScenarioId;
  projectId: ProjectId;
  // platform: Platform;
  lastIndex: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestScenarioBase = RecordTestScenarioBaseTraits & RecordTestScenarioRelationTraits;
export const RecordTestScenarioPropCamel = propertiesOf<RecordTestScenarioBase>();
export const RecordTestScenarioPropSnake = camelToSnakeCasePropertiesOf<RecordTestScenarioBase>();
