import { IsBoolean, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Kindable, TransformByKind } from '../../../common/case-kinds.js';
import { IsFilledString } from '../../../common/decorators.js';
import { WebSocketSpec } from '../../../common/specs.js';
import { Instance } from '../../../common/types.js';

export class DeviceRunAppiumServerSendMessage {
  @IsFilledString()
  serial!: string;
}

export class DeviceRunAppiumServerReceiveMessageLogValue extends Kindable<'DeviceRunAppiumServerReceiveMessageLogValue'> {
  static override kind = 'DeviceRunAppiumServerReceiveMessageLogValue';
}

export class DeviceRunAppiumServerReceiveMessageResultValue extends Kindable<'DeviceRunAppiumServerReceiveMessageResultValue'> {
  static override kind = 'DeviceRunAppiumServerReceiveMessageResultValue';

  @IsBoolean()
  success!: boolean;

  @IsNumber()
  serverPort!: number;

  @IsObject()
  @IsOptional()
  reason?: Error;
}

export const DeviceRunAppiumServerReceiveMessageValue = [DeviceRunAppiumServerReceiveMessageLogValue, DeviceRunAppiumServerReceiveMessageResultValue] as const;
export type DeviceRunAppiumServerReceiveMessageValue = Instance<(typeof DeviceRunAppiumServerReceiveMessageValue)[number]>;

export class DeviceRunAppiumServerReceiveMessage {
  @ValidateNested()
  @TransformByKind(DeviceRunAppiumServerReceiveMessageValue)
  value!: DeviceRunAppiumServerReceiveMessageValue;
}

export const DeviceRunAppiumServer = new WebSocketSpec({
  path: '/ws/devices/run-appium-server',
  sendMessage: DeviceRunAppiumServerSendMessage,
  receiveMessage: DeviceRunAppiumServerReceiveMessage,
});
