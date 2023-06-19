import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';

export class DeviceHostRecordPostProcessSendMessage {
  @IsFilledString()
  oldFilePath!: string;

  @IsFilledString()
  newFilePath!: string;
}

export const DeviceHostRecordPostProcess = new WebSocketSpec({
  path: '/ws/device-host/record-postprocess',
  sendMessage: DeviceHostRecordPostProcessSendMessage,
});
