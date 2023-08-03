import { HeaderRecord, Method } from '@dogu-tech/common';
import { RelayRequest } from '../specs/http/device-webdriver';
import { NullWebDriverCapabilitiesParser, ThrowableWebDriverCapabilitiesParser, WebDriverCapabilities } from './webdriver-capabilities';
import { createWebDriverEndPointFromRelayRequest } from './webdriver-endpoint-factories';

export type WebDriverEndpointType = 'new-session' | 'delete-session' | 'status' | 'session' | 'invalid';

export interface WebDriverNewSessionEndpointInfo {
  type: 'new-session';
  method: 'POST';
  capabilities: WebDriverCapabilities;
}

export interface WebDriverDeleteSessionEndpointInfo {
  type: 'delete-session';
  method: 'DELETE';
  sessionId: string;
}

export interface WebDriverStatusEndpointInfo {
  type: 'status';
  method: 'GET';
}

export interface WebDriverSessionEndpointInfo {
  type: 'session';
  method: Method;
  sessionId: string;
  command: string;
  reqBody?: Record<string, any>;
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
  constructor(public readonly info: WebDriverEndpointInfo) {}

  static async fromRelayRequest(request: RelayRequest, throwableParser: ThrowableWebDriverCapabilitiesParser = new NullWebDriverCapabilitiesParser()): Promise<WebDriverEndPoint> {
    return createWebDriverEndPointFromRelayRequest(request, throwableParser);
  }

  toRelayRequest(headers: HeaderRecord = {}): RelayRequest {
    switch (this.info.type) {
      case 'new-session':
        return {
          method: this.info.method,
          path: '/session',
          headers,
          reqBody: this.info.capabilities,
        };
      case 'delete-session':
        return {
          method: this.info.method,
          path: `/session/${this.info.sessionId}`,
          headers,
        };
      case 'status':
        return {
          method: this.info.method,
          path: '/status',
          headers,
        };
      case 'session':
        return {
          method: this.info.method,
          path: `/session/${this.info.sessionId}${this.info.command}`,
          headers,
          reqBody: this.info.reqBody,
        };
      case 'invalid':
        throw new Error('invalid endpoint');
      default:
        const _exhaustiveCheck: never = this.info;
        return _exhaustiveCheck;
    }
  }
}
