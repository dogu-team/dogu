import { RecordTestStepActionWebdriverInputId, RecordTestStepId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RecordTestStepBase } from './record-test-step';

interface RecordTestStepActionWebdriverInputRelationTraits {
  recordTestStep?: RecordTestStepBase;
}

export interface RecordTestStepActionWebdriverInputBaseTraits {
  recordTestStepActionWebdriverInputId: RecordTestStepActionWebdriverInputId;
  recordTestStepId: RecordTestStepId;
  deviceScreenSizeX: number;
  deviceScreenSizeY: number;
  value: string;
  boundX: number;
  boundY: number;
  boundWidth: number;
  boundHeight: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type RecordTestStepActionWebdriverInputBase = RecordTestStepActionWebdriverInputBaseTraits & RecordTestStepActionWebdriverInputRelationTraits;
export const RecordTestStepActionWebdriverInputPropCamel = propertiesOf<RecordTestStepActionWebdriverInputBase>();
export const RecordTestStepActionWebdriverInputPropSnake = camelToSnakeCasePropertiesOf<RecordTestStepActionWebdriverInputBase>();
