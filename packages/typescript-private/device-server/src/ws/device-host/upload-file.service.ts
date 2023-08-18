import { OnWebSocketClose, OnWebSocketMessage, WebSocketGatewayBase, WebSocketRegistryValueAccessor, WebSocketService } from '@dogu-private/nestjs-common';
import { DeviceHostUploadFileReceiveMessage, DeviceHostUploadFileSendMessage } from '@dogu-private/types';
import { closeWebSocketWithTruncateReason, errorify, Instance, stringify } from '@dogu-tech/common';
import {
  DeviceHostUploadFile,
  DeviceHostUploadFileCompleteSendValueDto,
  DeviceHostUploadFileInProgressSendValueDto,
  DeviceHostUploadFileStartSendValueDto,
} from '@dogu-tech/device-client-common';
import { HostPaths, renameRetry } from '@dogu-tech/node';
import fs from 'fs';
import { IncomingMessage } from 'http';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { DoguLogger } from '../../logger/logger';
import { ScanService } from '../../scan/scan.service';

interface Value {
  tempFilePath: string;
  filePath: string;
  fileSize: number;
  stream: fs.WriteStream | null;
}

@WebSocketService(DeviceHostUploadFile)
export class DeviceHostUploadFileService
  extends WebSocketGatewayBase<Value, typeof DeviceHostUploadFile.sendMessage, typeof DeviceHostUploadFile.receiveMessage>
  implements OnWebSocketMessage<Value, typeof DeviceHostUploadFile.sendMessage, typeof DeviceHostUploadFile.receiveMessage>, OnWebSocketClose<Value>
{
  constructor(private readonly scanService: ScanService, private readonly logger: DoguLogger) {
    super(DeviceHostUploadFile, logger, (event: WebSocket.MessageEvent) => {
      const { data } = event;
      if (data instanceof Buffer) {
        return DeviceHostUploadFileSendMessage.decode(data);
      }
      throw new Error(`Unexpected data type ${stringify(data)}`);
    });
  }

  override onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): Value {
    return { tempFilePath: '', filePath: '', fileSize: 0, stream: null };
  }

  onWebSocketMessage(webSocket: WebSocket, message: Instance<typeof DeviceHostUploadFile.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    try {
      this.onMessage(webSocket, message, valueAccessor);
    } catch (error) {
      closeWebSocketWithTruncateReason(webSocket, 1001, 'Upload failed');
    }
  }

  private onMessage(webSocket: WebSocket, message: Instance<typeof DeviceHostUploadFile.sendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const { value } = message;
    const { $case } = value;
    if ($case === 'start') {
      const { start } = value;
      this.onStart(webSocket, start, valueAccessor);
    } else if ($case === 'inProgress') {
      const { inProgress } = value;
      this.onInProgress(webSocket, inProgress, valueAccessor);
    } else if ($case === 'complete') {
      const { complete } = value;
      this.onComplete(webSocket, complete, valueAccessor);
    } else {
      throw new Error(`Unexpected case ${stringify(message)}`);
    }
  }

  private onStart(webSocket: WebSocket, value: DeviceHostUploadFileStartSendValueDto, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const { fileName, fileSize } = value;
    const tempFileName = uuidv4();
    const tempFilePath = path.resolve(HostPaths.doguTempPath(), tempFileName);
    if (!fs.existsSync(HostPaths.doguTempPath())) {
      fs.mkdirSync(HostPaths.doguTempPath(), { recursive: true });
    }
    const filePath = path.resolve(HostPaths.doguTempPath(), fileName);
    const stream = fs.createWriteStream(tempFilePath);
    stream.on('close', () => {
      this.logger.info('File closed');
    });
    stream.on('error', (error) => {
      this.logger.error('File error', { error });
      closeWebSocketWithTruncateReason(webSocket, 1001, errorify(error).message);
    });
    stream.on('finish', () => {
      this.logger.info('File finished');
    });
    valueAccessor.update({ tempFilePath, filePath, fileSize, stream });
    this.logger.info('File started', { tempFilePath, filePath });
  }

  private onInProgress(webSocket: WebSocket, value: DeviceHostUploadFileInProgressSendValueDto, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const { chunk } = value;
    // this.logger.debug('File chunk', { chunkSize: chunk.length });
    const { tempFilePath, stream } = valueAccessor.get();
    if (stream === null) {
      throw new Error('Stream is null');
    }
    stream.write(chunk, (error) => {
      if (error) {
        this.logger.error('File write error', { error });
        closeWebSocketWithTruncateReason(webSocket, 1001, errorify(error).message);
      }
      fs.promises
        .stat(tempFilePath)
        .then((stats) => {
          const receiveMessage: Instance<typeof DeviceHostUploadFile.receiveMessage> = {
            value: {
              $case: 'inProgress',
              inProgress: {
                offset: stats.size,
              },
            },
          };
          webSocket.send(DeviceHostUploadFileReceiveMessage.encode(receiveMessage).finish(), (error) => {
            if (error) {
              const casted = errorify(error);
              this.logger.error('File inProgressReceive send error', { error: casted });
              closeWebSocketWithTruncateReason(webSocket, 1001, casted.message);
            }
          });
        })
        .catch((error) => {
          const casted = errorify(error);
          this.logger.error('File stat error', { error: casted });
          closeWebSocketWithTruncateReason(webSocket, 1001, casted.message);
        });
    });
  }

  private onComplete(webSocket: WebSocket, value: DeviceHostUploadFileCompleteSendValueDto, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const { tempFilePath, filePath, fileSize, stream } = valueAccessor.get();
    if (stream === null) {
      throw new Error('Stream is null');
    }
    stream.end();
    stream.close((error) => {
      valueAccessor.update({ tempFilePath, filePath, fileSize, stream: null });
      if (error) {
        this.logger.error('File close error', { error });
        closeWebSocketWithTruncateReason(webSocket, 1001, errorify(error).message);
      } else {
        fs.promises
          .stat(tempFilePath)
          .then((stats) => {
            if (fileSize !== stats.size) {
              this.logger.error('File size mismatch', {
                tempFilePath,
                expected: fileSize,
                actual: stats.size,
              });
              throw new Error(`File size mismatch expected: ${fileSize} actual: ${stats.size}`);
            }
          })
          .then(async () => {
            await renameRetry(tempFilePath, filePath, this.logger);
            this.logger.info('File renamed', { tempFilePath, filePath });
          })
          .then(() => {
            const receiveMessage: Instance<typeof DeviceHostUploadFile.receiveMessage> = {
              value: {
                $case: 'complete',
                complete: {
                  filePath,
                },
              },
            };
            webSocket.send(DeviceHostUploadFileReceiveMessage.encode(receiveMessage).finish(), (error) => {
              if (error) {
                const casted = errorify(error);
                this.logger.error('File completeReceive send error', { error: casted });
                closeWebSocketWithTruncateReason(webSocket, 1001, casted.message);
              } else {
                closeWebSocketWithTruncateReason(webSocket, 1000);
              }
            });
          })
          .catch((error) => {
            const casted = errorify(error);
            this.logger.error('File rename error', { error: casted });
            closeWebSocketWithTruncateReason(webSocket, 1001, casted.message);
          });
      }
    });
  }

  onWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>): void {
    const { code } = event;
    const { tempFilePath, stream } = valueAccessor.get();
    if (stream !== null) {
      stream.end();
      stream.close((error) => {
        if (error) {
          this.logger.error('File close error', { error });
        }
        if (code !== 1000) {
          fs.promises.unlink(tempFilePath).catch((error) => {
            this.logger.error('File unlink error', { error: stringify(error) });
          });
        }
      });
    }
  }
}
