export interface HeaderValue {
  key: string;
  value: string;
}

export interface Headers {
  values: HeaderValue[];
}

export interface Body {
  value?: { $case: 'stringValue'; stringValue: string } | { $case: 'bytesValue'; bytesValue: Uint8Array };
}

export interface HttpRequest {
  protocolDomain?: string | undefined;
  method: string;
  path: string;
  headers?: Headers | undefined;
  query?: { [key: string]: any } | undefined;
  body?: Body | undefined;
}

export interface HttpResponse {
  statusCode: number;
  headers: Headers | undefined;
  body?: Body | undefined;
  request: HttpRequest | undefined;
}

export interface WebSocketConnection {
  protocolDomain?: string | undefined;
  path: string;
  query?: { [key: string]: any } | undefined;
}

export interface WebSocketMessage {
  value?: { $case: 'stringValue'; stringValue: string } | { $case: 'bytesValue'; bytesValue: Uint8Array };
}

export interface WebSocketClose {
  code: number;
  reason: string;
}

export interface WebSocketParam {
  value?:
    | { $case: 'connection'; connection: WebSocketConnection }
    | { $case: 'message'; message: WebSocketMessage }
    | {
        $case: 'close';
        close: WebSocketClose;
      };
}

export interface WebSocketOpenEvent {}

export interface WebSocketErrorEvent {
  reason: string;
}

export interface WebSocketCloseEvent {
  code: number;
  reason: string;
}

export interface WebSocketMessageEvent {
  value?: { $case: 'stringValue'; stringValue: string } | { $case: 'bytesValue'; bytesValue: Uint8Array };
}
