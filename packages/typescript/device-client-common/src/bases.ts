import { Closable, ConsoleLogger, fillOptionsSync, Printable, PromiseOrValue } from '@dogu-tech/common';
import {
  DeviceHostUploadFileSendMessage,
  DeviceTemporaryToken,
  HttpRequest,
  HttpResponse,
  WebSocketCloseEvent,
  WebSocketConnection,
  WebSocketErrorEvent,
  WebSocketMessageEvent,
  WebSocketOpenEvent,
} from '@dogu-tech/types';
import { Type } from 'class-transformer';
import { IsNumber, IsObject } from 'class-validator';

export interface DeviceWebSocketListener {
  onOpen?(ev: WebSocketOpenEvent): void;
  onError?(ev: WebSocketErrorEvent): void;
  onClose?(ev: WebSocketCloseEvent): void;
  onMessage?(ev: WebSocketMessageEvent): void;
}

export interface DeviceWebSocket {
  send(message: string | Uint8Array): void;
  close(code?: number, reason?: string): void;
}

export class DeviceClientOptions {
  /**
   * @default 0
   */
  @IsNumber()
  @Type(() => Number)
  port?: number;

  /**
   * @default ConsoleLogger.instance
   */
  @IsObject()
  printable?: Printable;

  /**
   * @default 60000
   * @unit milliseconds
   */
  @IsNumber()
  @Type(() => Number)
  timeout?: number;

  /**
   * @default empty
   */
  @IsObject()
  token?: DeviceTemporaryToken;
}

export function fillDeviceClientOptions(options?: DeviceClientOptions): Required<DeviceClientOptions> {
  return fillOptionsSync(
    DeviceClientOptions,
    {
      port: 0,
      printable: ConsoleLogger.instance,
      timeout: 60000,
      token: { value: '' },
    },
    options,
  );
}

export interface DeviceService {
  httpRequest(request: HttpRequest, options: Required<DeviceClientOptions>): PromiseOrValue<HttpResponse>;
  connectWebSocket(connection: WebSocketConnection, options: Required<DeviceClientOptions>, listener?: DeviceWebSocketListener): DeviceWebSocket;
}

export class HostFileUploader {
  constructor(readonly deviceWebSocket: DeviceWebSocket) {}

  write(chunk: ArrayBuffer): void {
    this.deviceWebSocket.send(
      DeviceHostUploadFileSendMessage.encode({
        value: {
          $case: 'inProgress',
          inProgress: {
            chunk: new Uint8Array(chunk),
          },
        },
      }).finish(),
    );
  }

  end(): void {
    this.deviceWebSocket.send(
      DeviceHostUploadFileSendMessage.encode({
        value: {
          $case: 'complete',
          complete: {},
        },
      }).finish(),
    );
  }

  close(code?: number, reason?: string): void {
    this.deviceWebSocket.close(code, reason);
  }
}

export class DeviceCloser implements Closable {
  constructor(readonly deviceWebSocket: DeviceWebSocket) {}

  close(): void {
    this.deviceWebSocket.close(1000, 'close');
  }
}
