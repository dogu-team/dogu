import { Log, WebSocketSpec } from '@dogu-tech/common';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeviceRunAppSendMessage {
  @IsString()
  @IsNotEmpty()
  serial!: string;

  @IsString()
  @IsNotEmpty()
  appPath!: string;
}

export class DeviceRunAppReceiveMessage extends Log {}

export const DeviceRunApp = new WebSocketSpec({
  path: '/ws/devices/run-app',
  sendMessage: DeviceRunAppSendMessage,
  receiveMessage: DeviceRunAppReceiveMessage,
});
