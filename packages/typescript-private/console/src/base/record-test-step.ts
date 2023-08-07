import { ProjectId, RecordTestStepId, TEST_STEP_TYPE } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectBase } from './project';

interface RecordTestStepRelationTraits {
  project?: ProjectBase;
}

export interface RecordTestStepBaseTraits {
  recordTestStepId: RecordTestStepId;
  projectId: ProjectId;
  name: string;
  type: TEST_STEP_TYPE;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestStepBase = RecordTestStepBaseTraits & RecordTestStepRelationTraits;
export const RecordTestStepPropCamel = propertiesOf<RecordTestStepBase>();
export const RecordTestStepPropSnake = camelToSnakeCasePropertiesOf<RecordTestStepBase>();
