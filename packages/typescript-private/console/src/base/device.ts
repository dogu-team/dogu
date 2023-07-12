import { PrivateProtocol } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceAndDeviceTagBase, OrganizationBase } from '..';
import { DeviceTagBase } from './device-tag';
import { HostBase } from './host';
import { ProjectBase } from './project';
import { ProjectAndDeviceBase } from './project-and-device';
import { RoutineDeviceJobBase } from './routine-device-job';

type Device = PrivateProtocol.Device;

interface DeviceRelationTraits {
  host?: HostBase;
  deviceTags?: DeviceTagBase[];
  projects?: ProjectBase[];
  routineDeviceJobs?: RoutineDeviceJobBase[];
  projectAndDevices?: ProjectAndDeviceBase[];
  deviceAndDeviceTags?: DeviceAndDeviceTagBase[];
  organization?: OrganizationBase;
}

export type DeviceBase = Omit<Required<Device>, 'heartbeat' | 'modelName'> & {
  heartbeat: Date | null;
  modelName: string | null;
  deletedAt: Date | null;
  enableHostDevice: number;
  maxParallelJobs: number;
} & DeviceRelationTraits;

export const DevicePropCamel = propertiesOf<DeviceBase>();
export const DevicePropSnake = camelToSnakeCasePropertiesOf<DeviceBase>();
