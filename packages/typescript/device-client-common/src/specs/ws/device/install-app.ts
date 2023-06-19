import { Log, WebSocketSpec } from '@dogu-tech/common';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeviceInstallAppSendMessage {
  @IsString()
  @IsNotEmpty()
  serial!: string;

  @IsString()
  @IsNotEmpty()
  appPath!: string;
}

export class DeviceInstallAppReceiveMessage extends Log {}

export const DeviceInstallApp = new WebSocketSpec({
  path: '/ws/devices/install-app',
  sendMessage: DeviceInstallAppSendMessage,
  receiveMessage: DeviceInstallAppReceiveMessage,
});
