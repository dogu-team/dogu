import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';
import { DeviceAlert } from '@dogu-tech/types';

export class DeviceAlertSubscribeSendMessage {
  @IsFilledString()
  serial!: string;
}

export class DeviceAlertSubscribeReceiveMessage implements DeviceAlert {
  @IsFilledString()
  title!: string;
}

export const DeviceAlertSubscribe = new WebSocketSpec({
  path: '/ws/devices/alert-subscribe',
  sendMessage: DeviceAlertSubscribeSendMessage,
  receiveMessage: DeviceAlertSubscribeReceiveMessage,
});
