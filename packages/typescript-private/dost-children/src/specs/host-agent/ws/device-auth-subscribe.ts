import { DeviceAdminToken } from '@dogu-private/types';
import { Instance, IsFilledString, Kindable, TransformByKind, WebSocketSpec } from '@dogu-tech/common';
import { ValidateNested } from 'class-validator';

//#region send
export class DeviceAuthSubscribeSendMessageValidateValue extends Kindable<'DeviceAuthSubscribeSendMessageValidateValue'> {
  static override kind = 'DeviceAuthSubscribeSendMessageValidateValue';

  @IsFilledString()
  currentToken!: DeviceAdminToken;
}

export class DeviceAuthSubscribeSendMessageOnRefreshedValue extends Kindable<'DeviceAuthSubscribeSendMessageOnRefreshedValue'> {
  static override kind = 'DeviceAuthSubscribeSendMessageOnRefreshedValue';

  @IsFilledString()
  beforeToken!: DeviceAdminToken;

  @IsFilledString()
  newToken!: DeviceAdminToken;
}

export const DeviceAuthSubscribeSendMessageValue = [DeviceAuthSubscribeSendMessageValidateValue, DeviceAuthSubscribeSendMessageOnRefreshedValue] as const;
export type DeviceAuthSubscribeSendMessageValue = Instance<(typeof DeviceAuthSubscribeSendMessageValue)[number]>;

export class DeviceAuthSubscribeSendMessage {
  @ValidateNested()
  @TransformByKind(DeviceAuthSubscribeSendMessageValue)
  value!: DeviceAuthSubscribeSendMessageValue;
}
//#endregion

//#region receive

export class DeviceAuthSubscribeReceiveMessageTryRefreshedValue extends Kindable<'DeviceAuthSubscribeReceiveMessageTryRefreshedValue'> {
  static override kind = 'DeviceAuthSubscribeReceiveMessageTryRefreshedValue';
}

export const DeviceAuthSubscribeReceiveMessageValue = [DeviceAuthSubscribeReceiveMessageTryRefreshedValue] as const;
export type DeviceAuthSubscribeReceiveMessageValue = Instance<(typeof DeviceAuthSubscribeReceiveMessageValue)[number]>;

export class DeviceAuthSubscribeReceiveMessage {
  @ValidateNested()
  @TransformByKind(DeviceAuthSubscribeReceiveMessageValue)
  value!: DeviceAuthSubscribeReceiveMessageValue;
}

//#endregion

export const DeviceAuthSubscribe = new WebSocketSpec({
  path: '/ws/device-auth',
  sendMessage: DeviceAuthSubscribeSendMessage,
  receiveMessage: DeviceAuthSubscribeReceiveMessage,
});
