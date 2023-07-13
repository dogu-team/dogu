import { RelayRequest } from '../specs/http/device-webdriver';
import { NullWebDriverCapabilitiesParser, ThrowableWebDriverCapabilitiesParser, WebDriverCapabilities } from './webdriver-capabilities';

export type WebDriverEndpointType = 'new-session' | 'delete-session' | 'status' | 'session' | 'invalid';

export interface WebDriverNewSessionEndpointInfo {
  type: 'new-session';
  capabilities: WebDriverCapabilities;
}

export interface WebDriverDeleteSessionEndpointInfo {
  type: 'delete-session';
  sessionId: string;
}

export interface WebDriverStatusEndpointInfo {
  type: 'status';
}

export interface WebDriverSessionEndpointInfo {
  type: 'session';
  sessionId: string;
  command: string;
}

export interface WebDriverInvalidEndpointInfo {
  type: 'invalid';
}

export type WebDriverEndpointInfo =
  | WebDriverNewSessionEndpointInfo
  | WebDriverDeleteSessionEndpointInfo
  | WebDriverStatusEndpointInfo
  | WebDriverSessionEndpointInfo
  | WebDriverInvalidEndpointInfo;

/**
 * @reference
 *  https://www.w3.org/TR/webdriver/#endpoints
 */
export class WebDriverEndPoint {
  private constructor(public readonly info: WebDriverEndpointInfo) {}

  static async create(request: RelayRequest, throwableParser: ThrowableWebDriverCapabilitiesParser = new NullWebDriverCapabilitiesParser()): Promise<WebDriverEndPoint> {
    if (request.path === 'session') {
      if (!request.reqBody) {
        throw new Error('request body is undefined');
      }
      const capabilities = await throwableParser.parse(request.reqBody);
      return new WebDriverEndPoint({
        type: 'new-session',
        capabilities: capabilities,
      });
    }

    if (request.path === 'status') {
      return new WebDriverEndPoint({
        type: 'status',
      });
    }

    const splited = request.path.split('/');
    if (splited.length < 2) {
      return new WebDriverEndPoint({
        type: 'invalid',
      });
    }
    const sessionId = splited[1];
    if (splited.length === 2 && request.method === 'DELETE') {
      return new WebDriverEndPoint({
        type: 'delete-session',
        sessionId,
      });
    }
    return new WebDriverEndPoint({
      type: 'session',
      sessionId,
      command: splited.slice(2).join('/'),
    });
  }
}
