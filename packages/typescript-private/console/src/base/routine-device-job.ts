import { RoutineDeviceJob } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase } from './device';
import { RoutineDeviceJobBrowserBase } from './routine-device-job-browser';
import { RoutineJobBase } from './routine-job';
import { RoutineStepBase } from './routine-step';

interface RoutineDeviceJobRelationTraits {
  device?: DeviceBase;
  routineJob?: RoutineJobBase;
  routineSteps?: RoutineStepBase[];
  routineDeviceJobBrowser?: RoutineDeviceJobBrowserBase;
}

export type RoutineDeviceJobBase = RoutineDeviceJob & RoutineDeviceJobRelationTraits;

export const RoutineDeviceJobPropCamel = propertiesOf<RoutineDeviceJobBase>();
export const RoutineDeviceJobPropSnake = camelToSnakeCasePropertiesOf<RoutineDeviceJobBase>();
