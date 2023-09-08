import { DeviceConnectionState, DeviceId, DeviceTagId, HostId, OrganizationId, ProjectId, StreamingOffer } from '@dogu-private/types';
import { IsArray, IsObject } from 'class-validator';
import { UserBase } from '../../base/user';
import { PageDtoBase } from '../pagination/page.dto';

export const MAX_TAG_NAMES_FILTER_LENGTH = 10;
export const MAX_PROJECT_IDS_FILTER_LENGTH = 10;

export interface AttachTagToDeviceDtoBase {
  tagId: DeviceTagId;
}

export interface DeviceStateDtoBase {
  connectionState?: DeviceConnectionState;
}

export interface FindAddableDevicesByOrganizationIdDtoBase extends PageDtoBase {
  deviceName?: string;
  connectionStates?: DeviceConnectionState[];
  hostId?: string;
}

export interface FindDevicesByOrganizationIdDtoBase extends PageDtoBase, FindAddableDevicesByOrganizationIdDtoBase {
  tagNames?: string[];
  projectIds?: string[];
}

export interface UpdateDeviceDtoBase {
  hostId?: HostId;
  connectionState?: DeviceConnectionState;
  name?: string;
  maxParallelJobs?: number;
}

export interface EnableDeviceDtoBase {
  isGlobal: boolean;
  projectId?: ProjectId;
}

export class DeviceStreamingSessionInfoDto {
  @IsObject({ each: true })
  @IsArray()
  users!: UserBase[];
}

export abstract class IsGlobalEnableDeviceDto {
  isGlobal!: true;
  projectId?: never;
}

export abstract class IsGlobalDisEnableDeviceDto {
  isGlobal!: false;
  projectId!: ProjectId;
}

export interface DeviceStreamingOffer extends StreamingOffer {
  organizationId: OrganizationId;
  deviceId: DeviceId;
}
