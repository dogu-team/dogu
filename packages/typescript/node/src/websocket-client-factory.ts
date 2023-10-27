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
