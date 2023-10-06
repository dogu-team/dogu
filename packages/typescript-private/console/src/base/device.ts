import { Device } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceAndDeviceTagBase } from './device-and-device-tag';
import { DeviceBrowserInstallationBase } from './device-browser-installation';
import { DeviceRunnerBase } from './device-runner';
import { DeviceTagBase } from './device-tag';
import { HostBase } from './host';
import { OrganizationBase } from './organization';
import { ProjectBase } from './project';
import { ProjectAndDeviceBase } from './project-and-device';
import { RecordDeviceJobBase } from './record-device-job';
import { RemoteDeviceJobBase } from './remote-device-job';
import { RoutineDeviceJobBase } from './routine-device-job';

interface DeviceRelationTraits {
  host?: HostBase;
  deviceTags?: DeviceTagBase[];
  projects?: ProjectBase[];
  routineDeviceJobs?: RoutineDeviceJobBase[];
  remoteDeviceJobs?: RemoteDeviceJobBase[];
  recordDeviceJobs?: RecordDeviceJobBase[];
  projectAndDevices?: ProjectAndDeviceBase[];
  deviceAndDeviceTags?: DeviceAndDeviceTagBase[];
  organization?: OrganizationBase;
  deviceBrowserInstallations?: DeviceBrowserInstallationBase[];
  deviceRunners?: DeviceRunnerBase[];
}

export enum DeviceUsageState {
  available = 'available',
  preparing = 'preparing',
  busy = 'busy',
}

export type DeviceBase = Omit<Required<Device>, 'heartbeat' | 'modelName' | 'displayError'> & {
  heartbeat: Date | null;
  modelName: string | null;
  displayError: string | null;
  deletedAt: Date | null;
  enableHostDevice: number;
  maxParallelJobs: number;
  location: string | null;
  usageState: DeviceUsageState;
} & DeviceRelationTraits;

export const DevicePropCamel = propertiesOf<DeviceBase>();
export const DevicePropSnake = camelToSnakeCasePropertiesOf<DeviceBase>();
