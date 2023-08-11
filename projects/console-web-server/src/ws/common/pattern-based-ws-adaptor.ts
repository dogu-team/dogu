import { Logger } from '@dogu-tech/node';
import { INestApplicationContext } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { WebSocketGateway } from '@nestjs/websockets';
import http, { IncomingMessage } from 'http';
import { match } from 'path-to-regexp';
import * as ws from 'ws';

export interface PatternBasedWebSocketInfo {
  path: string;
  params: Map<string, string>;
  query: Map<string, string>;
}

const PatternSet = new Set<string>();

export function PatternBasedWebSocketGateway(path: string): ClassDecorator {
  if (PatternSet.has(path)) {
    throw new Error(`path ${path} is already registered`);
  }

  PatternSet.add(path);
  return WebSocketGateway({ path });
}

type CreateOptions = Parameters<WsAdapter['create']>[1] & { path?: string };

class PatternBasedWebSocketServer extends ws.Server {
  constructor(options: ws.ServerOptions) {
    super(options);
  }

  override shouldHandle(request: IncomingMessage): boolean | Promise<boolean> {
    return true;
  }
}

export class PatternBasedWsAdapter extends WsAdapter {
  constructor(app: INestApplicationContext, logger: Logger) {
    super(app);
  }

  override ensureHttpServerExists(
    port: number,
    httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> = http.createServer(),
  ): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> {
    if (this.httpServersRegistry.has(port)) {
      /**
       * @note this type assertion does not matched with implementation of WsAdapter
       * @see https://github.com/nestjs/nest/blob/master/packages/platform-ws/adapters/ws-adapter.ts
       */
      return undefined as unknown as http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    }

    this.httpServersRegistry.set(port, httpServer);
    httpServer.on('upgrade', (request, socket, head) => {
      if (!request.headers.host) {
        this.logger.error('websocket request.headers.host is required', { headers: request.headers });
        socket.destroy();
        return;
      }

      const baseUrl = `ws://${request.headers.host}/`;
      if (!request.url) {
        this.logger.error('websocket request.url is required', { baseUrl });
        socket.destroy();
        return;
      }

      const urlObj = new URL(request.url, baseUrl);
      const { pathname } = urlObj;
      const wsServersCollection = this.wsServersRegistry.get(port);
      if (!wsServersCollection) {
        this.logger.error('websocket server is not found', { port });
        socket.destroy();
        return;
      }

      let isRequestDelegated = false;
      for (const wsServerAny of wsServersCollection) {
        const wsServer = wsServerAny as ws.Server;
        const matcher = match(wsServer.path, { decode: decodeURIComponent });
        const matchResult = matcher(pathname);
        if (matchResult) {
          const params = new Map(Object.entries(matchResult.params).map(([key, value]) => [key, value as string]));
          const query = new Map(urlObj.searchParams.entries());
          const info: PatternBasedWebSocketInfo = {
            path: wsServer.path,
            params,
            query,
          };
          wsServer.handleUpgrade(request, socket, head, (ws) => {
            wsServer.emit('connection', ws, request, info);
          });
          isRequestDelegated = true;
          break;
        }
      }

      if (!isRequestDelegated) {
        this.logger.error('request is not delegated to any websocket server', { port, pathname });
        socket.destroy();
      }
    });

    return httpServer;
  }

  override create(port: number, options?: CreateOptions): any {
    if (options?.path && PatternSet.has(options.path)) {
      return this.createPatternBasedWebSocketServer(port, options);
    }
    return super.create(port, options);
  }

  private createPatternBasedWebSocketServer(port: number, options: CreateOptions): PatternBasedWebSocketServer {
    if (!options?.path || typeof options.path !== 'string') {
      throw new Error('path is required and must be a string');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment
    const { server, path, ...wsOptions } = options;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.ensureHttpServerExists(port, this.httpServer);

    const wsServer = this.bindErrorHandler(
      new PatternBasedWebSocketServer({
        noServer: true,
        ...wsOptions,
      }),
    ) as PatternBasedWebSocketServer;

    this.addWsServerToRegistry(wsServer, port, path);
    return wsServer;
  }
}
