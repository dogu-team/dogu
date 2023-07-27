/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { Struct } from '../google/protobuf/struct';
import { ErrorResult } from './errors';

export enum DeviceConnectionState {
  /** DEVICE_CONNECTION_STATE_UNSPECIFIED - Not used. must be initialized to a different value. */
  DEVICE_CONNECTION_STATE_UNSPECIFIED = 0,
  DEVICE_CONNECTION_STATE_DISCONNECTED = 1,
  DEVICE_CONNECTION_STATE_CONNECTED = 2,
  UNRECOGNIZED = -1,
}

export function deviceConnectionStateFromJSON(object: any): DeviceConnectionState {
  switch (object) {
    case 0:
    case 'DEVICE_CONNECTION_STATE_UNSPECIFIED':
      return DeviceConnectionState.DEVICE_CONNECTION_STATE_UNSPECIFIED;
    case 1:
    case 'DEVICE_CONNECTION_STATE_DISCONNECTED':
      return DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED;
    case 2:
    case 'DEVICE_CONNECTION_STATE_CONNECTED':
      return DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return DeviceConnectionState.UNRECOGNIZED;
  }
}

export function deviceConnectionStateToJSON(object: DeviceConnectionState): string {
  switch (object) {
    case DeviceConnectionState.DEVICE_CONNECTION_STATE_UNSPECIFIED:
      return 'DEVICE_CONNECTION_STATE_UNSPECIFIED';
    case DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED:
      return 'DEVICE_CONNECTION_STATE_DISCONNECTED';
    case DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED:
      return 'DEVICE_CONNECTION_STATE_CONNECTED';
    case DeviceConnectionState.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

export interface DeviceHostUploadFileStartSendValue {
  fileName: string;
  fileSize: number;
}

export interface DeviceHostUploadFileInProgressSendValue {
  chunk: Uint8Array;
}

export interface DeviceHostUploadFileCompleteSendValue {}

export interface DeviceHostUploadFileSendMessage {
  value?:
    | { $case: 'start'; start: DeviceHostUploadFileStartSendValue }
    | {
        $case: 'inProgress';
        inProgress: DeviceHostUploadFileInProgressSendValue;
      }
    | { $case: 'complete'; complete: DeviceHostUploadFileCompleteSendValue };
}

export interface DeviceHostUploadFileInProgressReceiveValue {
  offset: number;
}

export interface DeviceHostUploadFileCompleteReceiveValue {
  filePath: string;
}

export interface DeviceHostUploadFileReceiveMessage {
  value?:
    | { $case: 'inProgress'; inProgress: DeviceHostUploadFileInProgressReceiveValue }
    | {
        $case: 'complete';
        complete: DeviceHostUploadFileCompleteReceiveValue;
      };
}

export interface DeviceServerResponse {
  value?: { $case: 'error'; error: ErrorResult } | { $case: 'data'; data: { [key: string]: any } | undefined };
}

function createBaseDeviceHostUploadFileStartSendValue(): DeviceHostUploadFileStartSendValue {
  return { fileName: '', fileSize: 0 };
}

export const DeviceHostUploadFileStartSendValue = {
  encode(message: DeviceHostUploadFileStartSendValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.fileName !== '') {
      writer.uint32(10).string(message.fileName);
    }
    if (message.fileSize !== 0) {
      writer.uint32(21).fixed32(message.fileSize);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileStartSendValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeviceHostUploadFileStartSendValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.fileName = reader.string();
          break;
        case 2:
          message.fileSize = reader.fixed32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeviceHostUploadFileStartSendValue {
    return {
      fileName: isSet(object.fileName) ? String(object.fileName) : '',
      fileSize: isSet(object.fileSize) ? Number(object.fileSize) : 0,
    };
  },

  toJSON(message: DeviceHostUploadFileStartSendValue): unknown {
    const obj: any = {};
    message.fileName !== undefined && (obj.fileName = message.fileName);
    message.fileSize !== undefined && (obj.fileSize = Math.round(message.fileSize));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeviceHostUploadFileStartSendValue>, I>>(object: I): DeviceHostUploadFileStartSendValue {
    const message = createBaseDeviceHostUploadFileStartSendValue();
    message.fileName = object.fileName ?? '';
    message.fileSize = object.fileSize ?? 0;
    return message;
  },
};

function createBaseDeviceHostUploadFileInProgressSendValue(): DeviceHostUploadFileInProgressSendValue {
  return { chunk: new Uint8Array() };
}

export const DeviceHostUploadFileInProgressSendValue = {
  encode(message: DeviceHostUploadFileInProgressSendValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chunk.length !== 0) {
      writer.uint32(10).bytes(message.chunk);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileInProgressSendValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeviceHostUploadFileInProgressSendValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chunk = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeviceHostUploadFileInProgressSendValue {
    return { chunk: isSet(object.chunk) ? bytesFromBase64(object.chunk) : new Uint8Array() };
  },

  toJSON(message: DeviceHostUploadFileInProgressSendValue): unknown {
    const obj: any = {};
    message.chunk !== undefined && (obj.chunk = base64FromBytes(message.chunk !== undefined ? message.chunk : new Uint8Array()));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeviceHostUploadFileInProgressSendValue>, I>>(object: I): DeviceHostUploadFileInProgressSendValue {
    const message = createBaseDeviceHostUploadFileInProgressSendValue();
    message.chunk = object.chunk ?? new Uint8Array();
    return message;
  },
};

function createBaseDeviceHostUploadFileCompleteSendValue(): DeviceHostUploadFileCompleteSendValue {
  return {};
}

export const DeviceHostUploadFileCompleteSendValue = {
  encode(_: DeviceHostUploadFileCompleteSendValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileCompleteSendValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeviceHostUploadFileCompleteSendValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): DeviceHostUploadFileCompleteSendValue {
    return {};
  },

  toJSON(_: DeviceHostUploadFileCompleteSendValue): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeviceHostUploadFileCompleteSendValue>, I>>(_: I): DeviceHostUploadFileCompleteSendValue {
    const message = createBaseDeviceHostUploadFileCompleteSendValue();
    return message;
  },
};

function createBaseDeviceHostUploadFileSendMessage(): DeviceHostUploadFileSendMessage {
  return { value: undefined };
}

export const DeviceHostUploadFileSendMessage = {
  encode(message: DeviceHostUploadFileSendMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'start') {
      DeviceHostUploadFileStartSendValue.encode(message.value.start, writer.uint32(10).fork()).ldelim();
    }
    if (message.value?.$case === 'inProgress') {
      DeviceHostUploadFileInProgressSendValue.encode(message.value.inProgress, writer.uint32(18).fork()).ldelim();
    }
    if (message.value?.$case === 'complete') {
      DeviceHostUploadFileCompleteSendValue.encode(message.value.complete, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileSendMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeviceHostUploadFileSendMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = { $case: 'start', start: DeviceHostUploadFileStartSendValue.decode(reader, reader.uint32()) };
          break;
        case 2:
          message.value = {
            $case: 'inProgress',
            inProgress: DeviceHostUploadFileInProgressSendValue.decode(reader, reader.uint32()),
          };
          break;
        case 3:
          message.value = {
            $case: 'complete',
            complete: DeviceHostUploadFileCompleteSendValue.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeviceHostUploadFileSendMessage {
    return {
      value: isSet(object.start)
        ? { $case: 'start', start: DeviceHostUploadFileStartSendValue.fromJSON(object.start) }
        : isSet(object.inProgress)
        ? { $case: 'inProgress', inProgress: DeviceHostUploadFileInProgressSendValue.fromJSON(object.inProgress) }
        : isSet(object.complete)
        ? { $case: 'complete', complete: DeviceHostUploadFileCompleteSendValue.fromJSON(object.complete) }
        : undefined,
    };
  },

  toJSON(message: DeviceHostUploadFileSendMessage): unknown {
    const obj: any = {};
    message.value?.$case === 'start' && (obj.start = message.value?.start ? DeviceHostUploadFileStartSendValue.toJSON(message.value?.start) : undefined);
    message.value?.$case === 'inProgress' && (obj.inProgress = message.value?.inProgress ? DeviceHostUploadFileInProgressSendValue.toJSON(message.value?.inProgress) : undefined);
    message.value?.$case === 'complete' && (obj.complete = message.value?.complete ? DeviceHostUploadFileCompleteSendValue.toJSON(message.value?.complete) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeviceHostUploadFileSendMessage>, I>>(object: I): DeviceHostUploadFileSendMessage {
    const message = createBaseDeviceHostUploadFileSendMessage();
    if (object.value?.$case === 'start' && object.value?.start !== undefined && object.value?.start !== null) {
      message.value = { $case: 'start', start: DeviceHostUploadFileStartSendValue.fromPartial(object.value.start) };
    }
    if (object.value?.$case === 'inProgress' && object.value?.inProgress !== undefined && object.value?.inProgress !== null) {
      message.value = {
        $case: 'inProgress',
        inProgress: DeviceHostUploadFileInProgressSendValue.fromPartial(object.value.inProgress),
      };
    }
    if (object.value?.$case === 'complete' && object.value?.complete !== undefined && object.value?.complete !== null) {
      message.value = {
        $case: 'complete',
        complete: DeviceHostUploadFileCompleteSendValue.fromPartial(object.value.complete),
      };
    }
    return message;
  },
};

function createBaseDeviceHostUploadFileInProgressReceiveValue(): DeviceHostUploadFileInProgressReceiveValue {
  return { offset: 0 };
}

export const DeviceHostUploadFileInProgressReceiveValue = {
  encode(message: DeviceHostUploadFileInProgressReceiveValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.offset !== 0) {
      writer.uint32(13).fixed32(message.offset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileInProgressReceiveValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeviceHostUploadFileInProgressReceiveValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.offset = reader.fixed32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeviceHostUploadFileInProgressReceiveValue {
    return { offset: isSet(object.offset) ? Number(object.offset) : 0 };
  },

  toJSON(message: DeviceHostUploadFileInProgressReceiveValue): unknown {
    const obj: any = {};
    message.offset !== undefined && (obj.offset = Math.round(message.offset));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeviceHostUploadFileInProgressReceiveValue>, I>>(object: I): DeviceHostUploadFileInProgressReceiveValue {
    const message = createBaseDeviceHostUploadFileInProgressReceiveValue();
    message.offset = object.offset ?? 0;
    return message;
  },
};

function createBaseDeviceHostUploadFileCompleteReceiveValue(): DeviceHostUploadFileCompleteReceiveValue {
  return { filePath: '' };
}

export const DeviceHostUploadFileCompleteReceiveValue = {
  encode(message: DeviceHostUploadFileCompleteReceiveValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.filePath !== '') {
      writer.uint32(10).string(message.filePath);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileCompleteReceiveValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeviceHostUploadFileCompleteReceiveValue();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.filePath = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeviceHostUploadFileCompleteReceiveValue {
    return { filePath: isSet(object.filePath) ? String(object.filePath) : '' };
  },

  toJSON(message: DeviceHostUploadFileCompleteReceiveValue): unknown {
    const obj: any = {};
    message.filePath !== undefined && (obj.filePath = message.filePath);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeviceHostUploadFileCompleteReceiveValue>, I>>(object: I): DeviceHostUploadFileCompleteReceiveValue {
    const message = createBaseDeviceHostUploadFileCompleteReceiveValue();
    message.filePath = object.filePath ?? '';
    return message;
  },
};

function createBaseDeviceHostUploadFileReceiveMessage(): DeviceHostUploadFileReceiveMessage {
  return { value: undefined };
}

export const DeviceHostUploadFileReceiveMessage = {
  encode(message: DeviceHostUploadFileReceiveMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'inProgress') {
      DeviceHostUploadFileInProgressReceiveValue.encode(message.value.inProgress, writer.uint32(10).fork()).ldelim();
    }
    if (message.value?.$case === 'complete') {
      DeviceHostUploadFileCompleteReceiveValue.encode(message.value.complete, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileReceiveMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeviceHostUploadFileReceiveMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = {
            $case: 'inProgress',
            inProgress: DeviceHostUploadFileInProgressReceiveValue.decode(reader, reader.uint32()),
          };
          break;
        case 2:
          message.value = {
            $case: 'complete',
            complete: DeviceHostUploadFileCompleteReceiveValue.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeviceHostUploadFileReceiveMessage {
    return {
      value: isSet(object.inProgress)
        ? { $case: 'inProgress', inProgress: DeviceHostUploadFileInProgressReceiveValue.fromJSON(object.inProgress) }
        : isSet(object.complete)
        ? { $case: 'complete', complete: DeviceHostUploadFileCompleteReceiveValue.fromJSON(object.complete) }
        : undefined,
    };
  },

  toJSON(message: DeviceHostUploadFileReceiveMessage): unknown {
    const obj: any = {};
    message.value?.$case === 'inProgress' &&
      (obj.inProgress = message.value?.inProgress ? DeviceHostUploadFileInProgressReceiveValue.toJSON(message.value?.inProgress) : undefined);
    message.value?.$case === 'complete' && (obj.complete = message.value?.complete ? DeviceHostUploadFileCompleteReceiveValue.toJSON(message.value?.complete) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeviceHostUploadFileReceiveMessage>, I>>(object: I): DeviceHostUploadFileReceiveMessage {
    const message = createBaseDeviceHostUploadFileReceiveMessage();
    if (object.value?.$case === 'inProgress' && object.value?.inProgress !== undefined && object.value?.inProgress !== null) {
      message.value = {
        $case: 'inProgress',
        inProgress: DeviceHostUploadFileInProgressReceiveValue.fromPartial(object.value.inProgress),
      };
    }
    if (object.value?.$case === 'complete' && object.value?.complete !== undefined && object.value?.complete !== null) {
      message.value = {
        $case: 'complete',
        complete: DeviceHostUploadFileCompleteReceiveValue.fromPartial(object.value.complete),
      };
    }
    return message;
  },
};

function createBaseDeviceServerResponse(): DeviceServerResponse {
  return { value: undefined };
}

export const DeviceServerResponse = {
  encode(message: DeviceServerResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'error') {
      ErrorResult.encode(message.value.error, writer.uint32(10).fork()).ldelim();
    }
    if (message.value?.$case === 'data') {
      Struct.encode(Struct.wrap(message.value.data), writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeviceServerResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeviceServerResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = { $case: 'error', error: ErrorResult.decode(reader, reader.uint32()) };
          break;
        case 2:
          message.value = { $case: 'data', data: Struct.unwrap(Struct.decode(reader, reader.uint32())) };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeviceServerResponse {
    return {
      value: isSet(object.error) ? { $case: 'error', error: ErrorResult.fromJSON(object.error) } : isSet(object.data) ? { $case: 'data', data: object.data } : undefined,
    };
  },

  toJSON(message: DeviceServerResponse): unknown {
    const obj: any = {};
    message.value?.$case === 'error' && (obj.error = message.value?.error ? ErrorResult.toJSON(message.value?.error) : undefined);
    message.value?.$case === 'data' && (obj.data = message.value?.data);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeviceServerResponse>, I>>(object: I): DeviceServerResponse {
    const message = createBaseDeviceServerResponse();
    if (object.value?.$case === 'error' && object.value?.error !== undefined && object.value?.error !== null) {
      message.value = { $case: 'error', error: ErrorResult.fromPartial(object.value.error) };
    }
    if (object.value?.$case === 'data' && object.value?.data !== undefined && object.value?.data !== null) {
      message.value = { $case: 'data', data: object.value.data };
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
