import { Instance, IsFilledString, Kindable, Log, TransformByKind, WebSocketSpec } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator';

export class DeviceRunAppiumServerSendMessage {
  @IsFilledString()
  serial!: string;
}

export class DeviceRunAppiumServerReceiveMessageLogValue extends Kindable<'DeviceRunAppiumServerReceiveMessageLogValue'> {
  static override kind = 'DeviceRunAppiumServerReceiveMessageLogValue';

  @ValidateNested()
  @Type(() => Log)
  log!: Log;
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
