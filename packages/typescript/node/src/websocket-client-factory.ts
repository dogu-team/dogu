import { WebSocket } from 'ws';

export interface WebSocketClientCreateOptions {
  url: string;

  /**
   * @default 5 * 60
   * @unit seconds
   * @description dogu aws load balancer idle timeout is 400 seconds.
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

export function messageToString(data: Buffer | ArrayBuffer | Buffer[] | string): string {
  if (data instanceof Buffer) {
    return data.toString();
  } else if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString();
  } else if (Array.isArray(data)) {
    if (data.length === 0) {
      return '';
    } else {
      return data.map((elem) => elem.toString()).join('');
    }
  } else if (typeof data === 'string') {
    return data;
  } else {
    throw new Error(`invalid data type: ${typeof data}`);
  }
}
