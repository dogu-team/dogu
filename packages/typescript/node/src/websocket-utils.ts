import { WebSocket } from 'ws';

export interface WebSocketClientCreateOptions {
  url: string;

  /**
   * @default 5 * 60
   * @unit seconds
   * @description dogu gcp load balancer idle timeout is 500 seconds.
   */
  pingInterval?: number;
}

function defaultWebSocketClientCreateOptions(options: WebSocketClientCreateOptions): Required<WebSocketClientCreateOptions> {
  return {
    pingInterval: 5 * 60,
    ...options,
  };
}

export class WebSocketClientFactory {
  create(options: WebSocketClientCreateOptions): WebSocket {
    const { url, pingInterval } = defaultWebSocketClientCreateOptions(options);
    const client = new WebSocket(url);
    client.on('open', () => {
      const interval = setInterval(() => {
        client.ping();
      }, pingInterval * 1000);
      client.on('close', () => clearInterval(interval));
    });
    return client;
  }
}

export function rawToString(raw: unknown): string {
  if (raw instanceof Buffer) {
    return raw.toString();
  } else if (raw instanceof ArrayBuffer) {
    return Buffer.from(raw).toString();
  } else if (Array.isArray(raw)) {
    if (raw.length === 0) {
      return '';
    } else {
      return raw.map((item) => rawToString(item)).join('');
    }
  } else if (typeof raw === 'string') {
    return raw;
  } else {
    throw new Error(`invalid data type: ${typeof raw}`);
  }
}
