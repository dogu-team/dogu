import { Instance, IsFilledString, Kindable, Log, TransformByKind, WebSocketSpec } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator';

export class DeviceForwardSendMessage {
  @IsFilledString()
  serial!: string;

  @IsNumber()
  hostPort!: number;

  @IsNumber()
  devicePort!: number;
}

export class DeviceForwardReceiveMessageLogValue extends Kindable<'DeviceForwardReceiveMessageLogValue'> {
  static override kind = 'DeviceForwardReceiveMessageLogValue';

  @ValidateNested()
  @Type(() => Log)
  log!: Log;
}

export class DeviceForwardReceiveMessageResultValue extends Kindable<'DeviceForwardReceiveMessageResultValue'> {
  static override kind = 'DeviceForwardReceiveMessageResultValue';

  @IsBoolean()
  success!: boolean;

  @IsObject()
  @IsOptional()
  reason?: Error;
}

export const DeviceForwardReceiveMessageValue = [DeviceForwardReceiveMessageLogValue, DeviceForwardReceiveMessageResultValue] as const;
export type DeviceForwardReceiveMessageValue = Instance<(typeof DeviceForwardReceiveMessageValue)[number]>;

export class DeviceForwardReceiveMessage {
  @ValidateNested()
  @TransformByKind(DeviceForwardReceiveMessageValue)
  value!: DeviceForwardReceiveMessageValue;
}

export const DeviceForward = new WebSocketSpec({
  path: '/ws/devices/forward',
  sendMessage: DeviceForwardSendMessage,
  receiveMessage: DeviceForwardReceiveMessage,
});
