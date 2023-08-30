import { WebSocketSpec } from '@dogu-tech/common';
import { BrowserName, BrowserPlatform, Serial } from '@dogu-tech/types';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BrowserAndDriverInstallation, EnsureBrowserAndDriverOptions } from '../../../validations/types/browser-manager';

export class DeviceHostEnsureBrowserAndDriverSendMessage implements EnsureBrowserAndDriverOptions {
  @IsIn(BrowserName)
  browserName!: BrowserName;

  @IsIn(BrowserPlatform)
  browserPlatform!: BrowserPlatform;

  @IsString()
  @IsOptional()
  requestedBrowserVersion?: string;

  @IsString()
  @IsOptional()
  deviceSerial?: Serial;
}

export class DeviceHostEnsureBrowserAndDriverReceiveMessage implements BrowserAndDriverInstallation {
  @IsIn(BrowserName)
  browserName!: BrowserName;

  @IsString()
  @IsOptional()
  browserPath?: string;

  @IsString()
  @IsOptional()
  browserPackageName?: string;

  @IsString()
  @IsOptional()
  browserVersion?: string;

  @IsNumber()
  @IsOptional()
  browserMajorVersion?: number;

  @IsString()
  @IsNotEmpty()
  browserDriverPath!: string;
}

export const DeviceHostEnsureBrowserAndDriver = new WebSocketSpec({
  path: '/ws/device-host/ensure-browser-and-driver',
  sendMessage: DeviceHostEnsureBrowserAndDriverSendMessage,
  receiveMessage: DeviceHostEnsureBrowserAndDriverReceiveMessage,
});
