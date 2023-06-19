import { IsFilledString, WebSocketSpec } from '@dogu-tech/common';
import { Serial } from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ScreenRecordOptionDto } from '../../../validations/types/streaming-recordings';

export class DeviceRecordingSendMessage {
  @IsFilledString()
  serial!: Serial;

  @ValidateNested()
  @Type(() => ScreenRecordOptionDto)
  screenRecordOption!: ScreenRecordOptionDto;
}

export const DeviceRecording = new WebSocketSpec({
  path: '/ws/devices/recording',
  sendMessage: DeviceRecordingSendMessage,
});
