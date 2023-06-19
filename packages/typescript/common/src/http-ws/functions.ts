import { stringify } from '../strings/functions';

export interface WebSocketCloseable {
  close(code?: number | undefined, reason?: string | undefined): void;
}

export function closeWebSocketWithTruncateReason(webSocket: WebSocketCloseable, code?: number, reason?: unknown): void {
  webSocket.close(code, stringify(reason)?.slice(0, 30));
}
