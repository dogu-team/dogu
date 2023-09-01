import { stringify } from './functions.js';

export interface WebSocketCloseable {
  close(code?: number, reason?: string): void;
}

export function closeWebSocketWithTruncateReason(webSocket: WebSocketCloseable, code?: number, reason?: unknown): void {
  webSocket.close(code, stringify(reason)?.slice(0, 30));
}
