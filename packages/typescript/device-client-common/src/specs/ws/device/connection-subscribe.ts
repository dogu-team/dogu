import { WebSocketSpec } from '@dogu-tech/common';
import { DeviceConnectionState, Platform, Serial } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator';
import { InstalledBrowserInfo } from '../../../validations/types/browser-manager';

export class DeviceConnectionSubscribeReceiveMessage {
  @IsString()
  @IsNotEmpty()
  serial!: Serial;

  @IsString()
  @IsNotEmpty()
  serialUnique!: Serial;

  @IsEnum(Platform)
  platform!: Platform;

  @IsString()
  model!: string;

  @IsString()
  version!: string;

  @IsEnum(DeviceConnectionState)
  state!: DeviceConnectionState;

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

export const DeviceConnectionSubscribe = new WebSocketSpec({
  path: '/ws/devices/connection-subscribe',
  receiveMessage: DeviceConnectionSubscribeReceiveMessage,
});
