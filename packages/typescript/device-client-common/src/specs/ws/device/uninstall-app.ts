import { Log, WebSocketSpec } from '@dogu-tech/common';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeviceUninstallAppSendMessage {
  @IsString()
  @IsNotEmpty()
  serial!: string;

  @IsString()
  @IsNotEmpty()
  appPath!: string;
}

export class DeviceUninstallAppReceiveMessage extends Log {}

export const DeviceUninstallApp = new WebSocketSpec({
  path: '/ws/devices/uninstall-app',
  sendMessage: DeviceUninstallAppSendMessage,
  receiveMessage: DeviceUninstallAppReceiveMessage,
});
