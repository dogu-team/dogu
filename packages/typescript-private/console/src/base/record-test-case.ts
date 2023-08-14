import { ProjectId, RecordTestCaseId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { ProjectBase } from './project';
import { RecordTestStepBase } from './record-test-step';

interface RecordTestCaseRelationTraits {
  project?: ProjectBase;
  recordTestSteps?: RecordTestStepBase[];
}

export interface RecordTestCaseBaseTraits {
  recordTestCaseId: RecordTestCaseId;
  projectId: ProjectId;
  name: string;
  activeDeviceSerial: string | null;
  activeDeviceScreenSizeX: number | null;
  activeDeviceScreenSizeY: number | null;
  activeSessionId: string | null;
  activeSessionKey: string | null;
  packageName: string | null;
  browserName: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestCaseBase = RecordTestCaseBaseTraits & RecordTestCaseRelationTraits;
export const RecordTestCasePropCamel = propertiesOf<RecordTestCaseBase>();
export const RecordTestCasePropSnake = camelToSnakeCasePropertiesOf<RecordTestCaseBase>();
