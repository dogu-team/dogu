import { IsFilledString, IsOptionalObject, WebSocketSpec } from '@dogu-tech/common';
import { Type } from 'class-transformer';
import { IsNumber, IsObject } from 'class-validator';

export class DeviceHostDownloadSharedResourceSendMessage {
  @IsFilledString()
  filePath!: string;

  @IsFilledString()
  url!: string;

  @IsNumber()
  @Type(() => Number)
  expectedFileSize!: number;

  @IsOptionalObject()
  headers?: Record<string, string>;
}

export class DeviceHostDownloadSharedResourceReceiveMessage {
  @IsNumber()
  @Type(() => Number)
  responseCode!: number;

  @IsObject()
  responseHeaders!: Record<string, string>;
}

export const DeviceHostDownloadSharedResource = new WebSocketSpec({
  path: '/ws/device-host/download-shared-resource',
  sendMessage: DeviceHostDownloadSharedResourceSendMessage,
  receiveMessage: DeviceHostDownloadSharedResourceReceiveMessage,
});
