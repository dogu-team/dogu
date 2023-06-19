import { WebSocketSpec } from '@dogu-tech/common';
import { StreamingAnswerDto, StreamingOfferDto } from '../../../validations/types/streaming-recordings';

export const DeviceStreaming = new WebSocketSpec({
  path: '/ws/devices/streaming',
  sendMessage: StreamingOfferDto,
  receiveMessage: StreamingAnswerDto,
});
