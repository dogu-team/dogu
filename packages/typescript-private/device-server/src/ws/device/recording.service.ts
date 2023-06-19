import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { CodeUtil, Serial } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, Instance } from '@dogu-tech/common';
import { DeviceRecording } from '@dogu-tech/device-client-common';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

interface Value {
  serial: Serial;
  isRecording: boolean;
}

@WebSocketService(DeviceRecording)
export class DeviceRecordingService
  extends WebSocketGatewayBase<Value, typeof DeviceRecording.sendMessage, typeof DeviceRecording.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceRecording.sendMessage, typeof DeviceRecording.receiveMessage>, OnWebSocketClose<Value>
{
  constructor(private readonly scanService: ScanService, private readonly logger: DoguLogger) {
    super(DeviceRecording, logger);
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): Value {
    return { serial: '', isRecording: false };
  }

  async onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceRecording.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { serial, screenRecordOption } = message;
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${serial} not found`);
    }

    const { isRecording } = valueAccessor.get();
    if (isRecording) {
      const result = await deviceChannel.stopRecord();
      const { code } = result;
      if (CodeUtil.isNotSuccess(code)) {
        closeWebSocketWithTruncateReason(webSocket, 1001, 'Recording stop on message failed');
      }
      valueAccessor.update({ serial, isRecording: false });
    }

    const result = await deviceChannel.startRecord(screenRecordOption);
    const { code } = result;
    if (CodeUtil.isNotSuccess(code)) {
      closeWebSocketWithTruncateReason(webSocket, 1001, 'Recording start failed');
    }
    valueAccessor.update({ serial, isRecording: true });
  }

  async onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): Promise<void> {
    const { serial, isRecording } = valueAccessor.get();
    if (!isRecording) {
      return;
    }
    const deviceChannel = this.scanService.findChannel(serial);
    if (deviceChannel === null) {
      throw new Error(`Device with serial ${serial} not found`);
    }
    const result = await deviceChannel.stopRecord();
    const { code } = result;
    if (CodeUtil.isNotSuccess(code)) {
      closeWebSocketWithTruncateReason(webSocket, 1001, 'Recording stop on close failed');
    } else {
      closeWebSocketWithTruncateReason(webSocket, 1000, 'Recording stopped');
    }
  }
}
