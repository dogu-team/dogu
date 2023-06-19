import { Caseable, Instance, IsFilledString, IsUint8Array, TransformByCase, WebSocketSpec } from '@dogu-tech/common';
import {
  DeviceHostUploadFileCompleteSendValue,
  DeviceHostUploadFileInProgressSendValue,
  DeviceHostUploadFileReceiveMessage,
  DeviceHostUploadFileSendMessage,
  DeviceHostUploadFileStartSendValue,
} from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';

export class DeviceHostUploadFileStartSendValueDto implements DeviceHostUploadFileStartSendValue {
  @IsFilledString()
  fileName!: string;

  @IsNumber()
  fileSize!: number;
}

export class DeviceHostUploadFileStartSendCaseValueDto extends Caseable<'start'> {
  static override $case = 'start';

  @ValidateNested()
  @Type(() => DeviceHostUploadFileStartSendValueDto)
  start!: DeviceHostUploadFileStartSendValueDto;
}

export class DeviceHostUploadFileInProgressSendValueDto implements DeviceHostUploadFileInProgressSendValue {
  @IsUint8Array()
  chunk!: Uint8Array;
}

export class DeviceHostUploadFileInProgressSendCaseValueDto extends Caseable<'inProgress'> {
  static override $case = 'inProgress';

  @ValidateNested()
  @Type(() => DeviceHostUploadFileInProgressSendValueDto)
  inProgress!: DeviceHostUploadFileInProgressSendValueDto;
}

export class DeviceHostUploadFileCompleteSendValueDto implements DeviceHostUploadFileCompleteSendValue {}

export class DeviceHostUploadFileCompleteSendCaseValueDto extends Caseable<'complete'> {
  static override $case = 'complete';

  @ValidateNested()
  @Type(() => DeviceHostUploadFileCompleteSendValueDto)
  complete!: DeviceHostUploadFileCompleteSendValueDto;
}

export const DeviceHostUploadFileSendCaseValue = [
  DeviceHostUploadFileStartSendCaseValueDto,
  DeviceHostUploadFileInProgressSendCaseValueDto,
  DeviceHostUploadFileCompleteSendCaseValueDto,
] as const;
export type DeviceHostUploadFileSendCaseValue = Instance<(typeof DeviceHostUploadFileSendCaseValue)[number]>;

export class DeviceHostUploadFileSendMessageDto implements DeviceHostUploadFileSendMessage {
  @ValidateNested()
  @TransformByCase(DeviceHostUploadFileSendCaseValue)
  value!: DeviceHostUploadFileSendCaseValue;
}

export class DeviceHostUploadFileReceiveMessageDto implements DeviceHostUploadFileReceiveMessage {
  @IsFilledString()
  filePath!: string;
}

export const DeviceHostUploadFile = new WebSocketSpec({
  path: '/ws/device-host/upload-file',
  sendMessage: DeviceHostUploadFileSendMessageDto,
  receiveMessage: DeviceHostUploadFileReceiveMessageDto,
});
