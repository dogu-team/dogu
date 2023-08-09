import { Logger } from '@dogu-tech/node';
import { INestApplicationContext } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { WebSocketGateway } from '@nestjs/websockets';
import http, { IncomingMessage } from 'http';
import * as ws from 'ws';

const PatternRoutableWebSocketPathSet = new Set<string>();

export function PatternRoutableWebSocketGateway(path: string): ClassDecorator {
  if (PatternRoutableWebSocketPathSet.has(path)) {
    throw new Error(`path ${path} is already registered`);
  }

  PatternRoutableWebSocketPathSet.add(path);
  return WebSocketGateway({ path });
}

type CreateOptions = Parameters<WsAdapter['create']>[1] & { path?: string };

class PatternRoutableWebSocketServer extends ws.Server {
  constructor(options: ws.ServerOptions) {
    super(options);
  }

  override shouldHandle(request: IncomingMessage): boolean | Promise<boolean> {
    return true;
  }
}

export class PatternRoutableWsAdapter extends WsAdapter {
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

      const pathname = new URL(request.url, baseUrl).pathname;
      const wsServersCollection = this.wsServersRegistry.get(port);
      if (!wsServersCollection) {
        this.logger.error('websocket server is not found', { port });
        socket.destroy();
        return;
      }

      let isRequestDelegated = false;
      for (const wsServer of wsServersCollection) {
        const casted = wsServer as ws.Server;
        if (this.matchPath(pathname, casted.path)) {
          casted.handleUpgrade(request, socket, head, (ws) => {
            casted.emit('connection', ws, request);
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

  private matchPath(path: string, pathPattern: string): boolean {
    const pathPatternParts = pathPattern.split('/');
    const pathParts = path.split('/');
    if (pathPatternParts.length !== pathParts.length) {
      return false;
    }

    for (let i = 0; i < pathPatternParts.length; i++) {
      const pathPatternPart = pathPatternParts[i];
      const pathPart = pathParts[i];
      if (pathPatternPart.startsWith(':')) {
        continue;
      }

      if (pathPatternPart !== pathPart) {
        return false;
      }
    }

    return true;
  }

  override create(port: number, options?: CreateOptions): any {
    if (options?.path && PatternRoutableWebSocketPathSet.has(options.path)) {
      return this.createPatternRoutableWebSocketServer(port, options);
    }
    return super.create(port, options);
  }

  private createPatternRoutableWebSocketServer(port: number, options: CreateOptions): PatternRoutableWebSocketServer {
    if (!options?.path || typeof options.path !== 'string') {
      throw new Error('path is required and must be a string');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment
    const { server, path, ...wsOptions } = options;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.ensureHttpServerExists(port, this.httpServer);

    const wsServer = this.bindErrorHandler(
      new PatternRoutableWebSocketServer({
        noServer: true,
        ...wsOptions,
      }),
    ) as PatternRoutableWebSocketServer;

    this.addWsServerToRegistry(wsServer, port, path);
    return wsServer;
  }
}
