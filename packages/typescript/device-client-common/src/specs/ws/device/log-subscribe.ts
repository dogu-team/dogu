import { IsFilledString, Log, WebSocketSpec } from '@dogu-tech/common';
import { IsArray } from 'class-validator';

export class DeviceLogSubscribeSendMessage {
  @IsFilledString()
  serial!: string;

  @IsArray()
  args!: string[];
}

export class DeviceLogSubscribeReceiveMessage extends Log {}

export const DeviceLogSubscribe = new WebSocketSpec({
  path: '/ws/devices/log-subscribe',
  sendMessage: DeviceLogSubscribeSendMessage,
  receiveMessage: DeviceLogSubscribeReceiveMessage,
});
