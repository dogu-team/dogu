import {
  Class,
  closeWebSocketWithTruncateReason,
  errorify,
  Instance,
  isFunction,
  Printable,
  PromiseOrValue,
  Registry,
  transformAndValidate,
  WebSocketSpec,
} from '@dogu-tech/common';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';

export type WebSocketMessageDataToObjectParser = (event: WebSocket.MessageEvent) => PromiseOrValue<unknown>;
export const defaultWebSocketMessageDataToObjectParser: WebSocketMessageDataToObjectParser = (event): unknown => JSON.parse(event.data.toString());

export type WebSocketRegistryValueGetter<Value> = () => Value;
export type WebSocketRegistryValueSetter<Value> = (value: Value) => void;

export class WebSocketRegistryValueAccessor<Value> {
  constructor(
    private readonly webSockets: Registry<WebSocket, Value>,
    private readonly webSocket: WebSocket,
  ) {}

  get: WebSocketRegistryValueGetter<Value> = () => this.webSockets.get(this.webSocket);
  update: WebSocketRegistryValueSetter<Value> = (value: Value) => this.webSockets.update(this.webSocket, value);
}

export interface OnWebSocketError<Value> {
  onWebSocketError: (webSocket: WebSocket, event: WebSocket.ErrorEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>) => PromiseOrValue<void>;
}

export interface OnWebSocketClose<Value> {
  onWebSocketClose: (webSocket: WebSocket, event: WebSocket.CloseEvent, valueAccessor: WebSocketRegistryValueAccessor<Value>) => PromiseOrValue<void>;
}

export interface OnWebSocketMessage<Value, SendMessage extends Class<SendMessage>, ReceiveMessage extends Class<ReceiveMessage>> {
  onWebSocketMessage: (webSocket: WebSocket, message: Instance<SendMessage>, valueAccessor: WebSocketRegistryValueAccessor<Value>) => PromiseOrValue<void>;
}

/**
 * @note SendMessage is a message that is sent from the client to the server.
 * ReceiveMessage is a message that is sent from the server to the client.
 */
export abstract class WebSocketGatewayBase<Value, SendMessage extends Class<SendMessage>, ReceiveMessage extends Class<ReceiveMessage>>
  implements OnGatewayConnection, OnGatewayDisconnect
{
  protected webSockets: Registry<WebSocket, Value>;

  constructor(
    protected readonly spec: WebSocketSpec<SendMessage, ReceiveMessage>,
    private readonly _logger: Printable,
    private readonly webSocketMessageDataToObjectParser: WebSocketMessageDataToObjectParser = defaultWebSocketMessageDataToObjectParser,
  ) {
    this.webSockets = new Registry<WebSocket, Value>(spec.path);
  }

  async handleConnection(webSocket: WebSocket, incomingMessage: IncomingMessage): Promise<void> {
    webSocket.addEventListener('close', (event: WebSocket.CloseEvent) => {
      this.callOnWebSocketClose(webSocket, event).catch((error) => {
        this._logger.error(error);
      });
    });
    webSocket.addEventListener('error', (event: WebSocket.ErrorEvent) => {
      this.callOnWebSocketError(webSocket, event).catch((error) => {
        this._logger.error(error);
      });
    });
    webSocket.addEventListener('message', (message: WebSocket.MessageEvent) => {
      this.callOnWebSocketMessage(webSocket, message).catch((error) => {
        this._logger.error(error);
      });
    });

    try {
      const value = await this.onWebSocketOpen(webSocket, incomingMessage);
      this.webSockets.register(webSocket, value);
    } catch (error) {
      this._logger.error('onWebSocketOpen error', { error: errorify(error) });
      closeWebSocketWithTruncateReason(webSocket, 1001, error);
      return;
    }
  }

  handleDisconnect(webSocket: WebSocket): void {
    this.webSockets.unregister(webSocket);
  }

  send(webSocket: WebSocket, message: Instance<ReceiveMessage>): void {
    webSocket.send(JSON.stringify(message));
  }

  notify(message: Instance<ReceiveMessage>): void {
    const data = JSON.stringify(message);
    this.webSockets.forEach((_, webSocket) => webSocket.send(data));
  }

  private hasOnWebSocketCloseHook(): this is OnWebSocketClose<Value> {
    return isFunction((this as unknown as OnWebSocketClose<Value>).onWebSocketClose);
  }

  private hasOnWebSocketErrorHook(): this is OnWebSocketError<Value> {
    return isFunction((this as unknown as OnWebSocketError<Value>).onWebSocketError);
  }

  private hasOnWebSocketMessageHook(): this is OnWebSocketMessage<Value, SendMessage, ReceiveMessage> {
    return isFunction((this as unknown as OnWebSocketMessage<Value, SendMessage, ReceiveMessage>).onWebSocketMessage);
  }

  private async callOnWebSocketClose(webSocket: WebSocket, event: WebSocket.CloseEvent): Promise<void> {
    if (this.hasOnWebSocketCloseHook()) {
      try {
        await this.onWebSocketClose(webSocket, event, new WebSocketRegistryValueAccessor(this.webSockets, webSocket));
      } catch (error) {
        this._logger.error('onWebSocketClose error', { error: errorify(error) });
      }
    }
  }

  private async callOnWebSocketError(webSocket: WebSocket, event: WebSocket.ErrorEvent): Promise<void> {
    if (this.hasOnWebSocketErrorHook()) {
      try {
        await this.onWebSocketError(webSocket, event, new WebSocketRegistryValueAccessor(this.webSockets, webSocket));
      } catch (error) {
        this._logger.error('onWebSocketError error', { error: errorify(error) });
      }
    }
  }

  private async callOnWebSocketMessage(webSocket: WebSocket, event: WebSocket.MessageEvent): Promise<void> {
    if (this.hasOnWebSocketMessageHook()) {
      try {
        const parsed = await this.webSocketMessageDataToObjectParser(event);
        const validated = await transformAndValidate(this.spec.sendMessage, parsed);
        await this.onWebSocketMessage(webSocket, validated, new WebSocketRegistryValueAccessor(this.webSockets, webSocket));
      } catch (error) {
        this._logger.error('onWebSocketMessage error', { error: errorify(error) });
        closeWebSocketWithTruncateReason(webSocket, 1001, error);
      }
    }
  }

  abstract onWebSocketOpen(webSocket: WebSocket, incommingMessage: IncomingMessage): PromiseOrValue<Value>;
}
