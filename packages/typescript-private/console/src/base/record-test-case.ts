import { ProjectId, RecordTestCaseId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordTestCaseAndRecordTestStepBase } from '..';
import { ProjectBase } from './project';

interface RecordTestCaseRelationTraits {
  project?: ProjectBase;
  recordTestCaseAndRecordTestSteps?: RecordTestCaseAndRecordTestStepBase[];
}

export interface RecordTestCaseBaseTraits {
  recordTestCaseId: RecordTestCaseId;
  projectId: ProjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestCaseBase = RecordTestCaseBaseTraits & RecordTestCaseRelationTraits;
export const RecordTestCasePropCamel = propertiesOf<RecordTestCaseBase>();
export const RecordTestCasePropSnake = camelToSnakeCasePropertiesOf<RecordTestCaseBase>();
