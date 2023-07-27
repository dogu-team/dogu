/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { Struct } from '../google/protobuf/struct';
import { ErrorResult } from './errors';

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

export interface HttpRequestParam {
  sequenceId: number;
  request: HttpRequest | undefined;
}

export interface HttpRequestResult {
  value?: { $case: 'response'; response: HttpResponse } | { $case: 'error'; error: ErrorResult };
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

export interface WebSocketOpenEvent {
  dummy: boolean;
}

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

export interface WebSocketResult {
  value?:
    | { $case: 'openEvent'; openEvent: WebSocketOpenEvent }
    | { $case: 'errorEvent'; errorEvent: WebSocketErrorEvent }
    | { $case: 'closeEvent'; closeEvent: WebSocketCloseEvent }
    | { $case: 'messageEvent'; messageEvent: WebSocketMessageEvent }
    | { $case: 'error'; error: ErrorResult };
}

export interface HttpRequestWebSocketResult {
  sequenceId: number;
  value?:
    | { $case: 'httpRequestResult'; httpRequestResult: HttpRequestResult }
    | {
        $case: 'webSocketResult';
        webSocketResult: WebSocketResult;
      };
}

function createBaseHeaderValue(): HeaderValue {
  return { key: '', value: '' };
}

export const HeaderValue = {
  encode(message: HeaderValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== '') {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== '') {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HeaderValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHeaderValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HeaderValue {
    return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' };
  },

  toJSON(message: HeaderValue): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HeaderValue>, I>>(object: I): HeaderValue {
    const message = createBaseHeaderValue();
    message.key = object.key ?? '';
    message.value = object.value ?? '';
    return message;
  },
};

function createBaseHeaders(): Headers {
  return { values: [] };
}

export const Headers = {
  encode(message: Headers, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.values) {
      HeaderValue.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Headers {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHeaders();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.values.push(HeaderValue.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Headers {
    return { values: Array.isArray(object?.values) ? object.values.map((e: any) => HeaderValue.fromJSON(e)) : [] };
  },

  toJSON(message: Headers): unknown {
    const obj: any = {};
    if (message.values) {
      obj.values = message.values.map((e) => (e ? HeaderValue.toJSON(e) : undefined));
    } else {
      obj.values = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Headers>, I>>(object: I): Headers {
    const message = createBaseHeaders();
    message.values = object.values?.map((e) => HeaderValue.fromPartial(e)) || [];
    return message;
  },
};

function createBaseBody(): Body {
  return { value: undefined };
}

export const Body = {
  encode(message: Body, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'stringValue') {
      writer.uint32(10).string(message.value.stringValue);
    }
    if (message.value?.$case === 'bytesValue') {
      writer.uint32(18).bytes(message.value.bytesValue);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Body {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBody();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = { $case: 'stringValue', stringValue: reader.string() };
          break;
        case 2:
          message.value = { $case: 'bytesValue', bytesValue: reader.bytes() };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Body {
    return {
      value: isSet(object.stringValue)
        ? { $case: 'stringValue', stringValue: String(object.stringValue) }
        : isSet(object.bytesValue)
        ? { $case: 'bytesValue', bytesValue: bytesFromBase64(object.bytesValue) }
        : undefined,
    };
  },

  toJSON(message: Body): unknown {
    const obj: any = {};
    message.value?.$case === 'stringValue' && (obj.stringValue = message.value?.stringValue);
    message.value?.$case === 'bytesValue' && (obj.bytesValue = message.value?.bytesValue !== undefined ? base64FromBytes(message.value?.bytesValue) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Body>, I>>(object: I): Body {
    const message = createBaseBody();
    if (object.value?.$case === 'stringValue' && object.value?.stringValue !== undefined && object.value?.stringValue !== null) {
      message.value = { $case: 'stringValue', stringValue: object.value.stringValue };
    }
    if (object.value?.$case === 'bytesValue' && object.value?.bytesValue !== undefined && object.value?.bytesValue !== null) {
      message.value = { $case: 'bytesValue', bytesValue: object.value.bytesValue };
    }
    return message;
  },
};

function createBaseHttpRequest(): HttpRequest {
  return { protocolDomain: undefined, method: '', path: '', headers: undefined, query: undefined, body: undefined };
}

export const HttpRequest = {
  encode(message: HttpRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.protocolDomain !== undefined) {
      writer.uint32(10).string(message.protocolDomain);
    }
    if (message.method !== '') {
      writer.uint32(18).string(message.method);
    }
    if (message.path !== '') {
      writer.uint32(26).string(message.path);
    }
    if (message.headers !== undefined) {
      Headers.encode(message.headers, writer.uint32(34).fork()).ldelim();
    }
    if (message.query !== undefined) {
      Struct.encode(Struct.wrap(message.query), writer.uint32(42).fork()).ldelim();
    }
    if (message.body !== undefined) {
      Body.encode(message.body, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HttpRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHttpRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.protocolDomain = reader.string();
          break;
        case 2:
          message.method = reader.string();
          break;
        case 3:
          message.path = reader.string();
          break;
        case 4:
          message.headers = Headers.decode(reader, reader.uint32());
          break;
        case 5:
          message.query = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        case 6:
          message.body = Body.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HttpRequest {
    return {
      protocolDomain: isSet(object.protocolDomain) ? String(object.protocolDomain) : undefined,
      method: isSet(object.method) ? String(object.method) : '',
      path: isSet(object.path) ? String(object.path) : '',
      headers: isSet(object.headers) ? Headers.fromJSON(object.headers) : undefined,
      query: isObject(object.query) ? object.query : undefined,
      body: isSet(object.body) ? Body.fromJSON(object.body) : undefined,
    };
  },

  toJSON(message: HttpRequest): unknown {
    const obj: any = {};
    message.protocolDomain !== undefined && (obj.protocolDomain = message.protocolDomain);
    message.method !== undefined && (obj.method = message.method);
    message.path !== undefined && (obj.path = message.path);
    message.headers !== undefined && (obj.headers = message.headers ? Headers.toJSON(message.headers) : undefined);
    message.query !== undefined && (obj.query = message.query);
    message.body !== undefined && (obj.body = message.body ? Body.toJSON(message.body) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HttpRequest>, I>>(object: I): HttpRequest {
    const message = createBaseHttpRequest();
    message.protocolDomain = object.protocolDomain ?? undefined;
    message.method = object.method ?? '';
    message.path = object.path ?? '';
    message.headers = object.headers !== undefined && object.headers !== null ? Headers.fromPartial(object.headers) : undefined;
    message.query = object.query ?? undefined;
    message.body = object.body !== undefined && object.body !== null ? Body.fromPartial(object.body) : undefined;
    return message;
  },
};

function createBaseHttpResponse(): HttpResponse {
  return { statusCode: 0, headers: undefined, body: undefined, request: undefined };
}

export const HttpResponse = {
  encode(message: HttpResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.statusCode !== 0) {
      writer.uint32(13).sfixed32(message.statusCode);
    }
    if (message.headers !== undefined) {
      Headers.encode(message.headers, writer.uint32(18).fork()).ldelim();
    }
    if (message.body !== undefined) {
      Body.encode(message.body, writer.uint32(26).fork()).ldelim();
    }
    if (message.request !== undefined) {
      HttpRequest.encode(message.request, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HttpResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHttpResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.statusCode = reader.sfixed32();
          break;
        case 2:
          message.headers = Headers.decode(reader, reader.uint32());
          break;
        case 3:
          message.body = Body.decode(reader, reader.uint32());
          break;
        case 4:
          message.request = HttpRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HttpResponse {
    return {
      statusCode: isSet(object.statusCode) ? Number(object.statusCode) : 0,
      headers: isSet(object.headers) ? Headers.fromJSON(object.headers) : undefined,
      body: isSet(object.body) ? Body.fromJSON(object.body) : undefined,
      request: isSet(object.request) ? HttpRequest.fromJSON(object.request) : undefined,
    };
  },

  toJSON(message: HttpResponse): unknown {
    const obj: any = {};
    message.statusCode !== undefined && (obj.statusCode = Math.round(message.statusCode));
    message.headers !== undefined && (obj.headers = message.headers ? Headers.toJSON(message.headers) : undefined);
    message.body !== undefined && (obj.body = message.body ? Body.toJSON(message.body) : undefined);
    message.request !== undefined && (obj.request = message.request ? HttpRequest.toJSON(message.request) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HttpResponse>, I>>(object: I): HttpResponse {
    const message = createBaseHttpResponse();
    message.statusCode = object.statusCode ?? 0;
    message.headers = object.headers !== undefined && object.headers !== null ? Headers.fromPartial(object.headers) : undefined;
    message.body = object.body !== undefined && object.body !== null ? Body.fromPartial(object.body) : undefined;
    message.request = object.request !== undefined && object.request !== null ? HttpRequest.fromPartial(object.request) : undefined;
    return message;
  },
};

function createBaseHttpRequestParam(): HttpRequestParam {
  return { sequenceId: 0, request: undefined };
}

export const HttpRequestParam = {
  encode(message: HttpRequestParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sequenceId !== 0) {
      writer.uint32(13).sfixed32(message.sequenceId);
    }
    if (message.request !== undefined) {
      HttpRequest.encode(message.request, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HttpRequestParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHttpRequestParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequenceId = reader.sfixed32();
          break;
        case 2:
          message.request = HttpRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HttpRequestParam {
    return {
      sequenceId: isSet(object.sequenceId) ? Number(object.sequenceId) : 0,
      request: isSet(object.request) ? HttpRequest.fromJSON(object.request) : undefined,
    };
  },

  toJSON(message: HttpRequestParam): unknown {
    const obj: any = {};
    message.sequenceId !== undefined && (obj.sequenceId = Math.round(message.sequenceId));
    message.request !== undefined && (obj.request = message.request ? HttpRequest.toJSON(message.request) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HttpRequestParam>, I>>(object: I): HttpRequestParam {
    const message = createBaseHttpRequestParam();
    message.sequenceId = object.sequenceId ?? 0;
    message.request = object.request !== undefined && object.request !== null ? HttpRequest.fromPartial(object.request) : undefined;
    return message;
  },
};

function createBaseHttpRequestResult(): HttpRequestResult {
  return { value: undefined };
}

export const HttpRequestResult = {
  encode(message: HttpRequestResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'response') {
      HttpResponse.encode(message.value.response, writer.uint32(18).fork()).ldelim();
    }
    if (message.value?.$case === 'error') {
      ErrorResult.encode(message.value.error, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HttpRequestResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHttpRequestResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.value = { $case: 'response', response: HttpResponse.decode(reader, reader.uint32()) };
          break;
        case 3:
          message.value = { $case: 'error', error: ErrorResult.decode(reader, reader.uint32()) };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HttpRequestResult {
    return {
      value: isSet(object.response)
        ? { $case: 'response', response: HttpResponse.fromJSON(object.response) }
        : isSet(object.error)
        ? { $case: 'error', error: ErrorResult.fromJSON(object.error) }
        : undefined,
    };
  },

  toJSON(message: HttpRequestResult): unknown {
    const obj: any = {};
    message.value?.$case === 'response' && (obj.response = message.value?.response ? HttpResponse.toJSON(message.value?.response) : undefined);
    message.value?.$case === 'error' && (obj.error = message.value?.error ? ErrorResult.toJSON(message.value?.error) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HttpRequestResult>, I>>(object: I): HttpRequestResult {
    const message = createBaseHttpRequestResult();
    if (object.value?.$case === 'response' && object.value?.response !== undefined && object.value?.response !== null) {
      message.value = { $case: 'response', response: HttpResponse.fromPartial(object.value.response) };
    }
    if (object.value?.$case === 'error' && object.value?.error !== undefined && object.value?.error !== null) {
      message.value = { $case: 'error', error: ErrorResult.fromPartial(object.value.error) };
    }
    return message;
  },
};

function createBaseWebSocketConnection(): WebSocketConnection {
  return { protocolDomain: undefined, path: '', query: undefined };
}

export const WebSocketConnection = {
  encode(message: WebSocketConnection, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.protocolDomain !== undefined) {
      writer.uint32(10).string(message.protocolDomain);
    }
    if (message.path !== '') {
      writer.uint32(18).string(message.path);
    }
    if (message.query !== undefined) {
      Struct.encode(Struct.wrap(message.query), writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketConnection {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWebSocketConnection();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.protocolDomain = reader.string();
          break;
        case 2:
          message.path = reader.string();
          break;
        case 3:
          message.query = Struct.unwrap(Struct.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WebSocketConnection {
    return {
      protocolDomain: isSet(object.protocolDomain) ? String(object.protocolDomain) : undefined,
      path: isSet(object.path) ? String(object.path) : '',
      query: isObject(object.query) ? object.query : undefined,
    };
  },

  toJSON(message: WebSocketConnection): unknown {
    const obj: any = {};
    message.protocolDomain !== undefined && (obj.protocolDomain = message.protocolDomain);
    message.path !== undefined && (obj.path = message.path);
    message.query !== undefined && (obj.query = message.query);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WebSocketConnection>, I>>(object: I): WebSocketConnection {
    const message = createBaseWebSocketConnection();
    message.protocolDomain = object.protocolDomain ?? undefined;
    message.path = object.path ?? '';
    message.query = object.query ?? undefined;
    return message;
  },
};

function createBaseWebSocketMessage(): WebSocketMessage {
  return { value: undefined };
}

export const WebSocketMessage = {
  encode(message: WebSocketMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'stringValue') {
      writer.uint32(10).string(message.value.stringValue);
    }
    if (message.value?.$case === 'bytesValue') {
      writer.uint32(18).bytes(message.value.bytesValue);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWebSocketMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = { $case: 'stringValue', stringValue: reader.string() };
          break;
        case 2:
          message.value = { $case: 'bytesValue', bytesValue: reader.bytes() };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WebSocketMessage {
    return {
      value: isSet(object.stringValue)
        ? { $case: 'stringValue', stringValue: String(object.stringValue) }
        : isSet(object.bytesValue)
        ? { $case: 'bytesValue', bytesValue: bytesFromBase64(object.bytesValue) }
        : undefined,
    };
  },

  toJSON(message: WebSocketMessage): unknown {
    const obj: any = {};
    message.value?.$case === 'stringValue' && (obj.stringValue = message.value?.stringValue);
    message.value?.$case === 'bytesValue' && (obj.bytesValue = message.value?.bytesValue !== undefined ? base64FromBytes(message.value?.bytesValue) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WebSocketMessage>, I>>(object: I): WebSocketMessage {
    const message = createBaseWebSocketMessage();
    if (object.value?.$case === 'stringValue' && object.value?.stringValue !== undefined && object.value?.stringValue !== null) {
      message.value = { $case: 'stringValue', stringValue: object.value.stringValue };
    }
    if (object.value?.$case === 'bytesValue' && object.value?.bytesValue !== undefined && object.value?.bytesValue !== null) {
      message.value = { $case: 'bytesValue', bytesValue: object.value.bytesValue };
    }
    return message;
  },
};

function createBaseWebSocketClose(): WebSocketClose {
  return { code: 0, reason: '' };
}

export const WebSocketClose = {
  encode(message: WebSocketClose, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(13).sfixed32(message.code);
    }
    if (message.reason !== '') {
      writer.uint32(18).string(message.reason);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketClose {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWebSocketClose();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.code = reader.sfixed32();
          break;
        case 2:
          message.reason = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WebSocketClose {
    return {
      code: isSet(object.code) ? Number(object.code) : 0,
      reason: isSet(object.reason) ? String(object.reason) : '',
    };
  },

  toJSON(message: WebSocketClose): unknown {
    const obj: any = {};
    message.code !== undefined && (obj.code = Math.round(message.code));
    message.reason !== undefined && (obj.reason = message.reason);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WebSocketClose>, I>>(object: I): WebSocketClose {
    const message = createBaseWebSocketClose();
    message.code = object.code ?? 0;
    message.reason = object.reason ?? '';
    return message;
  },
};

function createBaseWebSocketParam(): WebSocketParam {
  return { value: undefined };
}

export const WebSocketParam = {
  encode(message: WebSocketParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'connection') {
      WebSocketConnection.encode(message.value.connection, writer.uint32(10).fork()).ldelim();
    }
    if (message.value?.$case === 'message') {
      WebSocketMessage.encode(message.value.message, writer.uint32(18).fork()).ldelim();
    }
    if (message.value?.$case === 'close') {
      WebSocketClose.encode(message.value.close, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWebSocketParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = { $case: 'connection', connection: WebSocketConnection.decode(reader, reader.uint32()) };
          break;
        case 2:
          message.value = { $case: 'message', message: WebSocketMessage.decode(reader, reader.uint32()) };
          break;
        case 3:
          message.value = { $case: 'close', close: WebSocketClose.decode(reader, reader.uint32()) };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WebSocketParam {
    return {
      value: isSet(object.connection)
        ? { $case: 'connection', connection: WebSocketConnection.fromJSON(object.connection) }
        : isSet(object.message)
        ? { $case: 'message', message: WebSocketMessage.fromJSON(object.message) }
        : isSet(object.close)
        ? { $case: 'close', close: WebSocketClose.fromJSON(object.close) }
        : undefined,
    };
  },

  toJSON(message: WebSocketParam): unknown {
    const obj: any = {};
    message.value?.$case === 'connection' && (obj.connection = message.value?.connection ? WebSocketConnection.toJSON(message.value?.connection) : undefined);
    message.value?.$case === 'message' && (obj.message = message.value?.message ? WebSocketMessage.toJSON(message.value?.message) : undefined);
    message.value?.$case === 'close' && (obj.close = message.value?.close ? WebSocketClose.toJSON(message.value?.close) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WebSocketParam>, I>>(object: I): WebSocketParam {
    const message = createBaseWebSocketParam();
    if (object.value?.$case === 'connection' && object.value?.connection !== undefined && object.value?.connection !== null) {
      message.value = { $case: 'connection', connection: WebSocketConnection.fromPartial(object.value.connection) };
    }
    if (object.value?.$case === 'message' && object.value?.message !== undefined && object.value?.message !== null) {
      message.value = { $case: 'message', message: WebSocketMessage.fromPartial(object.value.message) };
    }
    if (object.value?.$case === 'close' && object.value?.close !== undefined && object.value?.close !== null) {
      message.value = { $case: 'close', close: WebSocketClose.fromPartial(object.value.close) };
    }
    return message;
  },
};

function createBaseWebSocketOpenEvent(): WebSocketOpenEvent {
  return { dummy: false };
}

export const WebSocketOpenEvent = {
  encode(message: WebSocketOpenEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.dummy === true) {
      writer.uint32(8).bool(message.dummy);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketOpenEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWebSocketOpenEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.dummy = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WebSocketOpenEvent {
    return { dummy: isSet(object.dummy) ? Boolean(object.dummy) : false };
  },

  toJSON(message: WebSocketOpenEvent): unknown {
    const obj: any = {};
    message.dummy !== undefined && (obj.dummy = message.dummy);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WebSocketOpenEvent>, I>>(object: I): WebSocketOpenEvent {
    const message = createBaseWebSocketOpenEvent();
    message.dummy = object.dummy ?? false;
    return message;
  },
};

function createBaseWebSocketErrorEvent(): WebSocketErrorEvent {
  return { reason: '' };
}

export const WebSocketErrorEvent = {
  encode(message: WebSocketErrorEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.reason !== '') {
      writer.uint32(10).string(message.reason);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketErrorEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWebSocketErrorEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.reason = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WebSocketErrorEvent {
    return { reason: isSet(object.reason) ? String(object.reason) : '' };
  },

  toJSON(message: WebSocketErrorEvent): unknown {
    const obj: any = {};
    message.reason !== undefined && (obj.reason = message.reason);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WebSocketErrorEvent>, I>>(object: I): WebSocketErrorEvent {
    const message = createBaseWebSocketErrorEvent();
    message.reason = object.reason ?? '';
    return message;
  },
};

function createBaseWebSocketCloseEvent(): WebSocketCloseEvent {
  return { code: 0, reason: '' };
}

export const WebSocketCloseEvent = {
  encode(message: WebSocketCloseEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(13).sfixed32(message.code);
    }
    if (message.reason !== '') {
      writer.uint32(18).string(message.reason);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketCloseEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWebSocketCloseEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.code = reader.sfixed32();
          break;
        case 2:
          message.reason = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WebSocketCloseEvent {
    return {
      code: isSet(object.code) ? Number(object.code) : 0,
      reason: isSet(object.reason) ? String(object.reason) : '',
    };
  },

  toJSON(message: WebSocketCloseEvent): unknown {
    const obj: any = {};
    message.code !== undefined && (obj.code = Math.round(message.code));
    message.reason !== undefined && (obj.reason = message.reason);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WebSocketCloseEvent>, I>>(object: I): WebSocketCloseEvent {
    const message = createBaseWebSocketCloseEvent();
    message.code = object.code ?? 0;
    message.reason = object.reason ?? '';
    return message;
  },
};

function createBaseWebSocketMessageEvent(): WebSocketMessageEvent {
  return { value: undefined };
}

export const WebSocketMessageEvent = {
  encode(message: WebSocketMessageEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'stringValue') {
      writer.uint32(10).string(message.value.stringValue);
    }
    if (message.value?.$case === 'bytesValue') {
      writer.uint32(18).bytes(message.value.bytesValue);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketMessageEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWebSocketMessageEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = { $case: 'stringValue', stringValue: reader.string() };
          break;
        case 2:
          message.value = { $case: 'bytesValue', bytesValue: reader.bytes() };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WebSocketMessageEvent {
    return {
      value: isSet(object.stringValue)
        ? { $case: 'stringValue', stringValue: String(object.stringValue) }
        : isSet(object.bytesValue)
        ? { $case: 'bytesValue', bytesValue: bytesFromBase64(object.bytesValue) }
        : undefined,
    };
  },

  toJSON(message: WebSocketMessageEvent): unknown {
    const obj: any = {};
    message.value?.$case === 'stringValue' && (obj.stringValue = message.value?.stringValue);
    message.value?.$case === 'bytesValue' && (obj.bytesValue = message.value?.bytesValue !== undefined ? base64FromBytes(message.value?.bytesValue) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WebSocketMessageEvent>, I>>(object: I): WebSocketMessageEvent {
    const message = createBaseWebSocketMessageEvent();
    if (object.value?.$case === 'stringValue' && object.value?.stringValue !== undefined && object.value?.stringValue !== null) {
      message.value = { $case: 'stringValue', stringValue: object.value.stringValue };
    }
    if (object.value?.$case === 'bytesValue' && object.value?.bytesValue !== undefined && object.value?.bytesValue !== null) {
      message.value = { $case: 'bytesValue', bytesValue: object.value.bytesValue };
    }
    return message;
  },
};

function createBaseWebSocketResult(): WebSocketResult {
  return { value: undefined };
}

export const WebSocketResult = {
  encode(message: WebSocketResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'openEvent') {
      WebSocketOpenEvent.encode(message.value.openEvent, writer.uint32(10).fork()).ldelim();
    }
    if (message.value?.$case === 'errorEvent') {
      WebSocketErrorEvent.encode(message.value.errorEvent, writer.uint32(18).fork()).ldelim();
    }
    if (message.value?.$case === 'closeEvent') {
      WebSocketCloseEvent.encode(message.value.closeEvent, writer.uint32(26).fork()).ldelim();
    }
    if (message.value?.$case === 'messageEvent') {
      WebSocketMessageEvent.encode(message.value.messageEvent, writer.uint32(34).fork()).ldelim();
    }
    if (message.value?.$case === 'error') {
      ErrorResult.encode(message.value.error, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWebSocketResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = { $case: 'openEvent', openEvent: WebSocketOpenEvent.decode(reader, reader.uint32()) };
          break;
        case 2:
          message.value = { $case: 'errorEvent', errorEvent: WebSocketErrorEvent.decode(reader, reader.uint32()) };
          break;
        case 3:
          message.value = { $case: 'closeEvent', closeEvent: WebSocketCloseEvent.decode(reader, reader.uint32()) };
          break;
        case 4:
          message.value = {
            $case: 'messageEvent',
            messageEvent: WebSocketMessageEvent.decode(reader, reader.uint32()),
          };
          break;
        case 5:
          message.value = { $case: 'error', error: ErrorResult.decode(reader, reader.uint32()) };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WebSocketResult {
    return {
      value: isSet(object.openEvent)
        ? { $case: 'openEvent', openEvent: WebSocketOpenEvent.fromJSON(object.openEvent) }
        : isSet(object.errorEvent)
        ? { $case: 'errorEvent', errorEvent: WebSocketErrorEvent.fromJSON(object.errorEvent) }
        : isSet(object.closeEvent)
        ? { $case: 'closeEvent', closeEvent: WebSocketCloseEvent.fromJSON(object.closeEvent) }
        : isSet(object.messageEvent)
        ? { $case: 'messageEvent', messageEvent: WebSocketMessageEvent.fromJSON(object.messageEvent) }
        : isSet(object.error)
        ? { $case: 'error', error: ErrorResult.fromJSON(object.error) }
        : undefined,
    };
  },

  toJSON(message: WebSocketResult): unknown {
    const obj: any = {};
    message.value?.$case === 'openEvent' && (obj.openEvent = message.value?.openEvent ? WebSocketOpenEvent.toJSON(message.value?.openEvent) : undefined);
    message.value?.$case === 'errorEvent' && (obj.errorEvent = message.value?.errorEvent ? WebSocketErrorEvent.toJSON(message.value?.errorEvent) : undefined);
    message.value?.$case === 'closeEvent' && (obj.closeEvent = message.value?.closeEvent ? WebSocketCloseEvent.toJSON(message.value?.closeEvent) : undefined);
    message.value?.$case === 'messageEvent' && (obj.messageEvent = message.value?.messageEvent ? WebSocketMessageEvent.toJSON(message.value?.messageEvent) : undefined);
    message.value?.$case === 'error' && (obj.error = message.value?.error ? ErrorResult.toJSON(message.value?.error) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WebSocketResult>, I>>(object: I): WebSocketResult {
    const message = createBaseWebSocketResult();
    if (object.value?.$case === 'openEvent' && object.value?.openEvent !== undefined && object.value?.openEvent !== null) {
      message.value = { $case: 'openEvent', openEvent: WebSocketOpenEvent.fromPartial(object.value.openEvent) };
    }
    if (object.value?.$case === 'errorEvent' && object.value?.errorEvent !== undefined && object.value?.errorEvent !== null) {
      message.value = { $case: 'errorEvent', errorEvent: WebSocketErrorEvent.fromPartial(object.value.errorEvent) };
    }
    if (object.value?.$case === 'closeEvent' && object.value?.closeEvent !== undefined && object.value?.closeEvent !== null) {
      message.value = { $case: 'closeEvent', closeEvent: WebSocketCloseEvent.fromPartial(object.value.closeEvent) };
    }
    if (object.value?.$case === 'messageEvent' && object.value?.messageEvent !== undefined && object.value?.messageEvent !== null) {
      message.value = {
        $case: 'messageEvent',
        messageEvent: WebSocketMessageEvent.fromPartial(object.value.messageEvent),
      };
    }
    if (object.value?.$case === 'error' && object.value?.error !== undefined && object.value?.error !== null) {
      message.value = { $case: 'error', error: ErrorResult.fromPartial(object.value.error) };
    }
    return message;
  },
};

function createBaseHttpRequestWebSocketResult(): HttpRequestWebSocketResult {
  return { sequenceId: 0, value: undefined };
}

export const HttpRequestWebSocketResult = {
  encode(message: HttpRequestWebSocketResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sequenceId !== 0) {
      writer.uint32(13).sfixed32(message.sequenceId);
    }
    if (message.value?.$case === 'httpRequestResult') {
      HttpRequestResult.encode(message.value.httpRequestResult, writer.uint32(18).fork()).ldelim();
    }
    if (message.value?.$case === 'webSocketResult') {
      WebSocketResult.encode(message.value.webSocketResult, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HttpRequestWebSocketResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHttpRequestWebSocketResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequenceId = reader.sfixed32();
          break;
        case 2:
          message.value = {
            $case: 'httpRequestResult',
            httpRequestResult: HttpRequestResult.decode(reader, reader.uint32()),
          };
          break;
        case 3:
          message.value = {
            $case: 'webSocketResult',
            webSocketResult: WebSocketResult.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HttpRequestWebSocketResult {
    return {
      sequenceId: isSet(object.sequenceId) ? Number(object.sequenceId) : 0,
      value: isSet(object.httpRequestResult)
        ? { $case: 'httpRequestResult', httpRequestResult: HttpRequestResult.fromJSON(object.httpRequestResult) }
        : isSet(object.webSocketResult)
        ? { $case: 'webSocketResult', webSocketResult: WebSocketResult.fromJSON(object.webSocketResult) }
        : undefined,
    };
  },

  toJSON(message: HttpRequestWebSocketResult): unknown {
    const obj: any = {};
    message.sequenceId !== undefined && (obj.sequenceId = Math.round(message.sequenceId));
    message.value?.$case === 'httpRequestResult' &&
      (obj.httpRequestResult = message.value?.httpRequestResult ? HttpRequestResult.toJSON(message.value?.httpRequestResult) : undefined);
    message.value?.$case === 'webSocketResult' && (obj.webSocketResult = message.value?.webSocketResult ? WebSocketResult.toJSON(message.value?.webSocketResult) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HttpRequestWebSocketResult>, I>>(object: I): HttpRequestWebSocketResult {
    const message = createBaseHttpRequestWebSocketResult();
    message.sequenceId = object.sequenceId ?? 0;
    if (object.value?.$case === 'httpRequestResult' && object.value?.httpRequestResult !== undefined && object.value?.httpRequestResult !== null) {
      message.value = {
        $case: 'httpRequestResult',
        httpRequestResult: HttpRequestResult.fromPartial(object.value.httpRequestResult),
      };
    }
    if (object.value?.$case === 'webSocketResult' && object.value?.webSocketResult !== undefined && object.value?.webSocketResult !== null) {
      message.value = {
        $case: 'webSocketResult',
        webSocketResult: WebSocketResult.fromPartial(object.value.webSocketResult),
      };
    }
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof global !== 'undefined') {
    return global;
  }
  throw 'Unable to locate global object';
})();

function bytesFromBase64(b64: string): Uint8Array {
  if (globalThis.Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, 'base64'));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString('base64');
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(''));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string }
  ? { [K in keyof Omit<T, '$case'>]?: DeepPartial<T[K]> } & { $case: T['$case'] }
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
type Exact<P, I extends P> = P extends Builtin ? P : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
