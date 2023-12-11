import { IncomingMessage } from 'http';

export interface OnWebSocketConnectedEventInterface {
  readonly webSocket: WebSocket;
  readonly incomingMessage: IncomingMessage;
}

export interface OnWebSocketDisconnectedEventInterface {
  readonly webSocket: WebSocket;
}

export class OnDeviceConnectionSubscriberConnectedEvent implements OnWebSocketConnectedEventInterface {
  static readonly type = 'on-device-connection-subscriber-connected';
  constructor(
    readonly webSocket: WebSocket,
    readonly incomingMessage: IncomingMessage,
  ) {}
}

export class OnDeviceConnectionSubscriberDisconnectedEvent implements OnWebSocketDisconnectedEventInterface {
  static readonly type = 'on-device-connection-subscriber-disconnected';
  constructor(readonly webSocket: WebSocket) {}
}

export class OnDeviceRuntimeInfoSubscriberConnectedEvent implements OnWebSocketConnectedEventInterface {
  static readonly type = 'on-device-runtime-info-subscriber-connected';
  constructor(
    readonly webSocket: WebSocket,
    readonly incomingMessage: IncomingMessage,
  ) {}
}

export class OnDeviceRuntimeInfoSubscriberDisconnectedEvent implements OnWebSocketDisconnectedEventInterface {
  static readonly type = 'on-device-runtime-info-subscriber-disconnected';
  constructor(readonly webSocket: WebSocket) {}
}
