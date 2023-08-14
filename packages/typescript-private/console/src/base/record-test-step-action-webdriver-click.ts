import { RecordTestStepActionWebdriverClickId, RecordTestStepId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordTestStepBase } from './record-test-step';

interface RecordTestStepActionWebdriverClickRelationTraits {
  recordTestStep?: RecordTestStepBase;
}

export interface RecordTestStepActionWebdriverClickBaseTraits {
  recordTestStepActionWebdriverClickId: RecordTestStepActionWebdriverClickId;
  recordTestStepId: RecordTestStepId;
  videoScreenSizeX: number;
  videoScreenSizeY: number;
  videoScreenPositionX: number;
  videoScreenPositionY: number;
  xpath: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestStepActionWebdriverClickBase = RecordTestStepActionWebdriverClickBaseTraits & RecordTestStepActionWebdriverClickRelationTraits;
export const RecordTestStepActionWebdriverClickPropCamel = propertiesOf<RecordTestStepActionWebdriverClickBase>();
export const RecordTestStepActionWebdriverClickPropSnake = camelToSnakeCasePropertiesOf<RecordTestStepActionWebdriverClickBase>();
