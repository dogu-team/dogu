import { stringify } from '../strings/functions';

export interface WebSocketCloseable {
  readonly readyState?: number;
  close(code?: number | undefined, reason?: string | undefined): void;
}

export function closeWebSocketWithTruncateReason(webSocket: WebSocketCloseable, code?: number, reason?: unknown): void {
  if (webSocket.readyState === WebSocket.CLOSING || webSocket.readyState === WebSocket.CLOSED) {
    return;
  }
  webSocket.close(code, stringify(reason)?.slice(0, 30));
}
