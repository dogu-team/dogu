import { RoutineStep } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DestBase } from './dest';
import { RoutineDeviceJobBase } from './routine-device-job';

export interface RoutineStepRelationTraits {
  routineDeviceJob?: RoutineDeviceJobBase;
  dests?: DestBase[];
}

export type RoutineStepBase = RoutineStep & RoutineStepRelationTraits;
export const RoutineStepPropCamel = propertiesOf<RoutineStepBase>();
export const RoutineStepPropSnake = camelToSnakeCasePropertiesOf<RoutineStepBase>();
