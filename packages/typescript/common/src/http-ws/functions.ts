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

export function closeWebSocketWithTruncateReason(webSocket: WebSocketCloseable, code?: number, reason?: unknown): void {
  if (webSocket.readyState === WebSocket.CLOSING || webSocket.readyState === WebSocket.CLOSED) {
    return;
  }
  webSocket.close(code, stringify(reason)?.slice(0, 30));
}
