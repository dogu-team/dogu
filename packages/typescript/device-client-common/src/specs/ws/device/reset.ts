import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';
import { Serial } from '@dogu-tech/types';

export class DeviceResetSendMessage {
  @IsFilledString()
  serial!: Serial;
}

export class DeviceResetReceiveMessage {}

export const DeviceReset = new WebSocketSpec({
  path: '/ws/devices/reset',
  sendMessage: DeviceResetSendMessage,
  receiveMessage: DeviceResetReceiveMessage,
});
