import { DeviceId, HostId, OrganizationId, Platform, Serial, ThirdPartyPathMap } from '@dogu-private/types';
import { createEventDefinition, IsFilledString } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsString, IsUUID } from 'class-validator';
import { DeviceConnectionInfo, DeviceResolutionInfo } from '../types';

export class OnDeviceConnectedEventValue implements DeviceConnectionInfo {
  @IsFilledString()
  serial!: Serial;

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

  @IsNumber()
  @Type(() => Number)
  resolutionWidth!: number;

  @IsNumber()
  @Type(() => Number)
  resolutionHeight!: number;
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
