import { DeviceId, ProjectId } from '@dogu-private/types';
import { camelToSnakeCasePropertiesOf, propertiesOf } from '@dogu-tech/common';
import { DeviceBase } from './device';
import { ProjectBase } from './project';

interface ProjectAndDeviceRelationTraits {
  project?: ProjectBase;
  device?: DeviceBase;
}
export interface ProjectAndDeviceBaseTraits {
  deviceId: DeviceId;
  projectId: ProjectId;
  createdAt: Date;
  deletedAt: Date | null;
}
export type ProjectAndDeviceBase = ProjectAndDeviceBaseTraits & ProjectAndDeviceRelationTraits;

export const ProjectAndDevicePropCamel = propertiesOf<ProjectAndDeviceBase>();
export const ProjectAndDevicePropSnake = camelToSnakeCasePropertiesOf<ProjectAndDeviceBase>();
