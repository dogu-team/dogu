import { RoutineDeviceJobBrowser } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { RoutineDeviceJobBase } from './routine-device-job';

interface RoutineDeviceJobBrowserRelationTraits {
  routineDeviceJob?: RoutineDeviceJobBase;
}

export type RoutineDeviceJobBrowserBase = RoutineDeviceJobBrowser & RoutineDeviceJobBrowserRelationTraits;

export const RoutineDeviceJobBrowserPropCamel = propertiesOf<RoutineDeviceJobBrowserBase>();
export const RoutineDeviceJobBrowserPropSnake = camelToSnakeCasePropertiesOf<RoutineDeviceJobBrowserBase>();
