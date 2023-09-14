import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';
import { Serial } from '@dogu-tech/types';
import { IsNumber } from 'class-validator';

export class DeviceFindWindowsSendMessage {
  @IsFilledString()
  serial!: Serial;

  @IsNumber()
  parentPid!: number;
}

export class DeviceFindWindowsReceiveMessage {
  @IsNumber()
  pid!: number;
}

export const DeviceFindWindows = new WebSocketSpec({
  path: '/ws/devices/find-windows',
  sendMessage: DeviceFindWindowsSendMessage,
  receiveMessage: DeviceFindWindowsReceiveMessage,
});
