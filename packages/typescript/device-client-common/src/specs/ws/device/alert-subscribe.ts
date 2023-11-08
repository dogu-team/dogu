import { Instance, IsFilledString, Kindable, TransformByKind, WebSocketSpec } from '@dogu-tech/common';
import { DeviceAlert } from '@dogu-tech/types';
import { ValidateNested } from 'class-validator';

export class DeviceAlertSubscribeSendMessage {
  @IsFilledString()
  serial!: string;
}

export class DeviceAlertSubscribeReceiveMessageOnShowValue extends Kindable<'DeviceAlertSubscribeReceiveMessageOnShowValue'> implements DeviceAlert {
  static override kind = 'DeviceAlertSubscribeReceiveMessageOnShowValue';
  @IsFilledString()
  title!: string;
}

export class DeviceAlertSubscribeReceiveMessageOnCloseValue extends Kindable<'DeviceAlertSubscribeReceiveMessageOnCloseValue'> {
  static override kind = 'DeviceAlertSubscribeReceiveMessageOnCloseValue';
  @IsFilledString()
  title!: string;
}

export const DeviceAlertSubscribeReceiveMessageValue = [DeviceAlertSubscribeReceiveMessageOnShowValue, DeviceAlertSubscribeReceiveMessageOnCloseValue] as const;
export type DeviceAlertSubscribeReceiveMessageValue = Instance<(typeof DeviceAlertSubscribeReceiveMessageValue)[number]>;

export class DeviceAlertSubscribeReceiveMessage {
  @ValidateNested()
  @TransformByKind(DeviceAlertSubscribeReceiveMessageValue)
  value!: DeviceAlertSubscribeReceiveMessageValue;
}

export const DeviceAlertSubscribe = new WebSocketSpec({
  path: '/ws/devices/alert-subscribe',
  sendMessage: DeviceAlertSubscribeSendMessage,
  receiveMessage: DeviceAlertSubscribeReceiveMessage,
});
