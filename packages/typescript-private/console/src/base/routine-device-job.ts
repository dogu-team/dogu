import { RoutineDeviceJob } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase } from './device';
import { RoutineJobBase } from './routine-job';
import { RoutineStepBase } from './routine-step';

interface RoutineDeviceJobRelationTraits {
  device?: DeviceBase;
  routineJob?: RoutineJobBase;
  routineSteps?: RoutineStepBase[];
}

export type RoutineDeviceJobBase = RoutineDeviceJob & RoutineDeviceJobRelationTraits;

export const RoutineDeviceJobPropCamel = propertiesOf<RoutineDeviceJobBase>();
export const RoutineDeviceJobPropSnake = camelToSnakeCasePropertiesOf<RoutineDeviceJobBase>();
