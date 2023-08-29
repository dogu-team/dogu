import { DeviceId, HostId, OrganizationId, Platform, Serial, ThirdPartyPathMap } from '@dogu-private/types';
import { createEventDefinition, IsFilledString } from '@dogu-tech/common';
import { InstalledBrowserInfo } from '@dogu-tech/device-client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { DeviceConnectionInfo, DeviceResolutionInfo } from '../types';

export class OnDeviceConnectedEventValue implements DeviceConnectionInfo {
  @IsFilledString()
  serial!: Serial;

  @IsFilledString()
  serialUnique!: Serial;

  @IsEnum(Platform)
  platform!: Platform;

  @IsString()
  model!: string;

  @IsString()
  version!: string;

  @IsUUID()
  organizationId!: OrganizationId;

  @IsUUID()
  hostId!: HostId;

  @IsString()
  manufacturer!: string;

  @Min(0)
  @Max(1)
  @IsNumber()
  @IsNotEmpty()
  isVirtual!: number;

  @IsNumber()
  @Type(() => Number)
  resolutionWidth!: number;

  @IsNumber()
  @Type(() => Number)
  resolutionHeight!: number;

  @ValidateNested({ each: true })
  @Type(() => InstalledBrowserInfo)
  @IsArray()
  installedBrowserInfos!: InstalledBrowserInfo[];
}
export const OnDeviceConnectedEvent = createEventDefinition('OnDeviceConnected', OnDeviceConnectedEventValue);

export class OnDeviceDisconnectedEventValue {
  @IsString()
  @IsNotEmpty()
  serial!: Serial;
}
export const OnDeviceDisconnectedEvent = createEventDefinition('OnDeviceDisconnected', OnDeviceDisconnectedEventValue);

export class OnDeviceResolvedEventValue extends OnDeviceConnectedEventValue implements DeviceResolutionInfo {
  @IsUUID()
  deviceId!: DeviceId;

  @IsEnum(Platform)
  hostPlatform!: Platform;

  @IsFilledString()
  rootWorkspacePath!: string;

  @IsFilledString()
  recordWorkspacePath!: string;

  @IsFilledString()
  hostWorkspacePath!: string;

  @IsFilledString()
  deviceWorkspacePath!: string;

  @IsNotEmptyObject()
  pathMap!: ThirdPartyPathMap;
}
export const OnDeviceResolvedEvent = createEventDefinition('OnDeviceResolved', OnDeviceResolvedEventValue);

export class OnDeviceConnectionSubscriberDisconnectedEventValue {}
export const OnDeviceConnectionSubscriberDisconnectedEvent = createEventDefinition('OnDeviceConnectionSubscriberDisconnected', OnDeviceConnectionSubscriberDisconnectedEventValue);
