import { RelayRequest } from '../specs/http/device-webdriver';
import { ThrowableWebDriverCapabilitiesParser } from './webdriver-capabilities';
import { WebDriverEndPoint } from './webdriver-endpoint';

interface EndPointFactoryOptions {
  request: RelayRequest;
  throwableParser: ThrowableWebDriverCapabilitiesParser;
}

type EndPointFactory = (options: EndPointFactoryOptions, next: () => Promise<WebDriverEndPoint>) => Promise<WebDriverEndPoint>;

const InvalidEndPointFactory: EndPointFactory = async (options, next) => {
  return new WebDriverEndPoint({
    type: 'invalid',
  });
};

const NewSessionEndPointFactory: EndPointFactory = async (options, next) => {
  const { method, path } = options.request;
  if (method === 'POST' && path === '/session') {
    if (!options.request.reqBody) {
      throw new Error('request body is undefined');
    }

    const capabilities = await options.throwableParser.parse(options.request.reqBody);
    return new WebDriverEndPoint({
      type: 'new-session',
      method: 'POST',
      capabilities,
    });
  }

  return next();
};

const StatusEndPointFactory: EndPointFactory = async (options, next) => {
  const { method, path } = options.request;
  if (method === 'GET' && path === '/status') {
    return new WebDriverEndPoint({
      type: 'status',
      method: 'GET',
    });
  }

  return next();
};

interface SessionCommandEndPointFactoryOptions extends EndPointFactoryOptions {
  sessionId: string;
  command?: string;
}

type SessionCommandEndPointFactory = (options: SessionCommandEndPointFactoryOptions, next: () => Promise<WebDriverEndPoint>) => Promise<WebDriverEndPoint>;

const DeleteSessionSessionCommandEndPointFactory: SessionCommandEndPointFactory = async (options, next) => {
  const { method, path } = options.request;
  if (method === 'DELETE' && path === `/session/${options.sessionId}`) {
    return new WebDriverEndPoint({
      type: 'delete-session',
      method: 'DELETE',
      sessionId: options.sessionId,
    });
  }

  return next();
};

const GenericSessionCommandEndPointFactory: SessionCommandEndPointFactory = async (options, next) => {
  const { method, path } = options.request;
  const { sessionId, command } = options;
  if (command) {
    return new WebDriverEndPoint({
      type: 'session',
      method,
      sessionId,
      command,
    });
  }

  return next();
};

const SessionCommandPattern = /^\/session\/([0-9a-f-]+)(\/.*)?$/;
const SessionCommandFactories: SessionCommandEndPointFactory[] = [
  DeleteSessionSessionCommandEndPointFactory, //
  GenericSessionCommandEndPointFactory,
];

const SessionCommandEndPointFactoryFactory: EndPointFactory = async (options, next) => {
  const match = SessionCommandPattern.exec(options.request.path);
  if (match) {
    const [, sessionId, command] = match as (string | undefined)[];
    if (!sessionId) {
      throw new Error(`invalid sessionId: ${options.request.path}`);
    }

    const sessionCommandOptions: SessionCommandEndPointFactoryOptions = {
      ...options,
      sessionId,
      command,
    };
    const sessionCommandNexts = SessionCommandFactories.map((factory) => factory.bind(factory, sessionCommandOptions));
    const sessionCommandNext = async (): Promise<WebDriverEndPoint> => {
      const sessionCommandNextFactory = sessionCommandNexts.shift();
      if (!sessionCommandNextFactory) {
        return next();
      }
      return sessionCommandNextFactory(sessionCommandNext);
    };
    return sessionCommandNext();
  }

  return next();
};

const EndPointFactories: EndPointFactory[] = [
  NewSessionEndPointFactory, //
  StatusEndPointFactory,
  SessionCommandEndPointFactoryFactory,
  InvalidEndPointFactory,
];

export function createWebDriverEndPointFromRelayRequest(request: RelayRequest, throwableParser: ThrowableWebDriverCapabilitiesParser): Promise<WebDriverEndPoint> {
  const options: EndPointFactoryOptions = {
    request,
    throwableParser,
  };
  const nexts = EndPointFactories.map((factory) => factory.bind(factory, options));
  const next = async (): Promise<WebDriverEndPoint> => {
    const nextFactory = nexts.shift();
    if (!nextFactory) {
      throw new Error('invalid endpoint');
    }
    return nextFactory(next);
  };
  return next();
}
