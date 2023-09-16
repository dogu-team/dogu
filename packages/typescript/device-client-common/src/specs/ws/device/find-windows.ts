import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';
import { Serial } from '@dogu-tech/types';
import { IsBoolean, IsNumber } from 'class-validator';

export class DeviceFindWindowsSendMessage {
  @IsFilledString()
  serial!: Serial;

  @IsNumber()
  parentPid!: number;

  @IsBoolean()
  isSafari!: boolean;
}

export class DeviceFindWindowsReceiveMessage {
  @IsNumber()
  pid!: number;

  @IsNumber()
  width!: number;

  @IsNumber()
  height!: number;
}

export const DeviceFindWindows = new WebSocketSpec({
  path: '/ws/devices/find-windows',
  sendMessage: DeviceFindWindowsSendMessage,
  receiveMessage: DeviceFindWindowsReceiveMessage,
});
