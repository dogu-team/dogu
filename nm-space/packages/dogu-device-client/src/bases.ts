import { Type } from 'class-transformer';
import { IsNumber, IsObject } from 'class-validator';
import { Printable } from './common/logs.js';
import { PromiseOrValue } from './common/types.js';
import { HttpRequest, HttpResponse, WebSocketCloseEvent, WebSocketConnection, WebSocketErrorEvent, WebSocketMessageEvent, WebSocketOpenEvent } from './types/http_ws.js';
import { fillOptionsSync } from './validations/functions.js';

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
   * @default console
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
}

export function fillDeviceClientOptions(options?: DeviceClientOptions): Required<DeviceClientOptions> {
  return fillOptionsSync(
    DeviceClientOptions,
    {
      port: 0,
      printable: console,
      timeout: 60000,
    },
    options,
  );
}

export interface DeviceService {
  httpRequest(request: HttpRequest, options: Required<DeviceClientOptions>): PromiseOrValue<HttpResponse>;
  connectWebSocket(connection: WebSocketConnection, options: Required<DeviceClientOptions>, listener?: DeviceWebSocketListener): DeviceWebSocket;
}

export class DeviceCloser {
  constructor(readonly deviceWebSocket: DeviceWebSocket) {}

  close(): void {
    this.deviceWebSocket.close(1000, 'close');
  }
}
