import { IsBoolean, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Kindable, TransformByKind } from '../../../common/case-kinds.js';
import { IsFilledString } from '../../../common/decorators.js';
import { WebSocketSpec } from '../../../common/specs.js';
import { Instance } from '../../../common/types.js';

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
