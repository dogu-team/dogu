import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';
import { Serial } from '@dogu-tech/types';

export class DeviceJoinWifiSendMessage {
  @IsFilledString()
  serial!: Serial;

  @IsFilledString()
  ssid!: string;

  @IsFilledString()
  password!: string;
}

export class DeviceJoinWifiReceiveMessage {}

export const DeviceJoinWifi = new WebSocketSpec({
  path: '/ws/devices/join-wifi',
  sendMessage: DeviceJoinWifiSendMessage,
  receiveMessage: DeviceJoinWifiReceiveMessage,
});
