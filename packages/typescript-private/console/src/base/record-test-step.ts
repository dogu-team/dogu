import { ProjectId, RecordTestStepId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectBase } from './project';

interface RecordTestStepRelationTraits {
  project?: ProjectBase;
}

export interface RecordTestStepBaseTraits {
  recordTestStepId: RecordTestStepId;
  projectId: ProjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestStepBase = RecordTestStepBaseTraits & RecordTestStepRelationTraits;
export const RecordTestStepPropCamel = propertiesOf<RecordTestStepBase>();
export const RecordTestStepPropSnake = camelToSnakeCasePropertiesOf<RecordTestStepBase>();
