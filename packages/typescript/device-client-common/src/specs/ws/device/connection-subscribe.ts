import { WebSocketSpec } from '@dogu-tech/common';
import { DeviceConnectionState, Platform, Serial } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class DeviceConnectionSubscribeReceiveMessage {
  @IsString()
  @IsNotEmpty()
  serial!: Serial;

  @IsString()
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
  errorMessage!: string;

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
}

export function DefaultDeviceConnectionSubscribeReceiveMessage(): DeviceConnectionSubscribeReceiveMessage {
  return {
    serial: '',
    serialUnique: '',
    platform: Platform.PLATFORM_UNSPECIFIED,
    model: '',
    version: '',
    state: DeviceConnectionState.DEVICE_CONNECTION_STATE_UNSPECIFIED,
    errorMessage: '',
    manufacturer: '',
    isVirtual: 0,
    resolutionWidth: 0,
    resolutionHeight: 0,
  };
}

export const DeviceConnectionSubscribe = new WebSocketSpec({
  path: '/ws/devices/connection-subscribe',
  receiveMessage: DeviceConnectionSubscribeReceiveMessage,
});
