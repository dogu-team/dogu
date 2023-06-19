import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { RuntimeInfoDto } from '../../../validations/types/runtime-infos';

export class DeviceRuntimeInfoSubscribeSendMessage {
  @IsFilledString()
  serial!: string;
}

export class DeviceRuntimeInfoSubscribeReceiveMessage {
  @ValidateNested()
  @Type(() => RuntimeInfoDto)
  runtimeInfo!: RuntimeInfoDto;
}

export const DeviceRuntimeInfoSubscribe = new WebSocketSpec({
  path: '/ws/devices/runtime-info-subscribe',
  sendMessage: DeviceRuntimeInfoSubscribeSendMessage,
  receiveMessage: DeviceRuntimeInfoSubscribeReceiveMessage,
});
