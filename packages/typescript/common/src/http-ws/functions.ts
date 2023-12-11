import { stringify } from '../strings/functions';

export interface WebSocketCloseable {
  readonly readyState?: number;
  close(code?: number | undefined, reason?: string | undefined): void;
}

const WebSocket = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

export const WebSocketCode = {
  // common codes
  NormalClosure: 1000,
  GoingAway: 1001,
  ProtocolError: 1002,
  UnsupportedData: 1003,
  NoStatusReceived: 1005,
  AbnormalClosure: 1006,
  InvalidFramePayloadData: 1007,
  PolicyViolation: 1008,
  MessageTooBig: 1009,
  MissingExtension: 1010,
  InternalError: 1011,
  ServiceRestart: 1012,
  TryAgainLater: 1013,
  BadGateway: 1014,
  TlsHandshake: 1015,

  // custom codes
  Unauthorized: 4000,
};

export function closeWebSocketWithTruncateReason(webSocket: WebSocketCloseable, code?: number, reason?: unknown): void {
  if (webSocket.readyState === WebSocket.CLOSING || webSocket.readyState === WebSocket.CLOSED) {
    return;
  }

  if (reason instanceof Error) {
    reason = reason.message;
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close#reason
  const message = stringify(reason);
  const uint8Array = new TextEncoder().encode(message);
  const truncatedMessage = new TextDecoder().decode(uint8Array.slice(0, 123));
  webSocket.close(code, truncatedMessage);
}
