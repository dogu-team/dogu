import { Class, Instance } from '../validations/types';
import { Method, Path } from './types';

export const DefaultPathProvider = class {};
export type PathProviderType<T extends Class<T> = typeof DefaultPathProvider> = Instance<T>;

export class ControllerSpec {
  path: Path;

  constructor(options: { path: Path }) {
    const { path } = options;
    this.path = path;
  }
}

export interface ControllerMethodSpecOptions<PathProvider extends PathProviderType, Query = never, RequestBody = never, ResponseBody = never> {
  controllerSpec: ControllerSpec;
  method: Method;
  path: Path;
  pathProvider: PathProvider;
  query?: Query;
  requestBody?: RequestBody;
  responseBody?: ResponseBody;
}

export class ControllerMethodSpec<PathProvider extends PathProviderType, Query = never, RequestBody = never, ResponseBody = never> {
  controllerSpec: ControllerSpec;
  method: Method;
  path: Path;
  pathProvider: PathProvider;
  query: Query | never;
  requestBody: RequestBody | never;
  responseBody: ResponseBody | never;

  constructor(options: ControllerMethodSpecOptions<PathProvider, Query, RequestBody, ResponseBody>) {
    const { controllerSpec, method, path, pathProvider, query, requestBody, responseBody } = options;
    this.controllerSpec = controllerSpec;
    this.method = method;
    this.path = path;
    this.pathProvider = pathProvider;
    this.query = query ?? ({} as never);
    this.requestBody = requestBody ?? ({} as never);
    this.responseBody = responseBody ?? ({} as never);
  }

  resolvePath(pathProvider: PathProviderType): string {
    return resolvePathHttp(this, pathProvider);
  }
}

function resolvePathHttp<PathProvider extends PathProviderType, Query, RequestBody, ResponseBody>(
  controllerMethodSpec: ControllerMethodSpec<PathProvider, Query, RequestBody, ResponseBody>,
  pathProvider: typeof controllerMethodSpec.pathProvider,
): string {
  const fullPath = controllerMethodSpec.controllerSpec.path + controllerMethodSpec.path;
  return resolvePathInternal(pathProvider, fullPath);
}

function resolvePathInternal<PathProvider extends PathProviderType>(pathProvider: PathProvider, path: string): string {
  const keySymbols = Reflect.ownKeys(pathProvider);
  const keys = keySymbols.map((value) => (typeof value === 'symbol' ? String(value) : value));
  const resolved = keys.reduce((previous, current) => {
    const key = `:${String(current)}`;
    const value = String(Reflect.get(pathProvider, current));
    return previous.replace(key, value);
  }, path);
  if (resolved.includes(':')) {
    throw new Error('path is not resolved');
  }
  return resolved;
}

export class WebSocketSpec<SendMessage = never, ReceiveMessage = never> {
  path: Path;
  sendMessage: SendMessage | never;
  receiveMessage: ReceiveMessage | never;

  constructor(options: { path: Path; sendMessage?: SendMessage; receiveMessage?: ReceiveMessage }) {
    const { path, sendMessage, receiveMessage } = options;
    this.path = path;
    this.sendMessage = sendMessage ?? ({} as never);
    this.receiveMessage = receiveMessage ?? ({} as never);
  }
}
