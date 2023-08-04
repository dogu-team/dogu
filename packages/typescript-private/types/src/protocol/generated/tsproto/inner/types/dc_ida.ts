/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { ErrorResult } from '../../outer/errors';

export interface DcIdaRunAppParam {
  appPath: string;
  installedAppNames: string[];
  bundleId: string;
}

export interface DcIdaRunAppResult {
  error: ErrorResult | undefined;
}

export interface DcIdaGetSystemInfoParam {}

export interface DcIdaGetSystemInfoResult {
  screenWidth: number;
  screenHeight: number;
}

export interface DcIdaIsPortListeningParam {
  port: number;
}

export interface DcIdaIsPortListeningResult {
  isListening: boolean;
}

function createBaseDcIdaRunAppParam(): DcIdaRunAppParam {
  return { appPath: '', installedAppNames: [], bundleId: '' };
}

export const DcIdaRunAppParam = {
  encode(message: DcIdaRunAppParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.appPath !== '') {
      writer.uint32(10).string(message.appPath);
    }
    for (const v of message.installedAppNames) {
      writer.uint32(18).string(v!);
    }
    if (message.bundleId !== '') {
      writer.uint32(26).string(message.bundleId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaRunAppParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdaRunAppParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.appPath = reader.string();
          break;
        case 2:
          message.installedAppNames.push(reader.string());
          break;
        case 3:
          message.bundleId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdaRunAppParam {
    return {
      appPath: isSet(object.appPath) ? String(object.appPath) : '',
      installedAppNames: Array.isArray(object?.installedAppNames) ? object.installedAppNames.map((e: any) => String(e)) : [],
      bundleId: isSet(object.bundleId) ? String(object.bundleId) : '',
    };
  },

  toJSON(message: DcIdaRunAppParam): unknown {
    const obj: any = {};
    message.appPath !== undefined && (obj.appPath = message.appPath);
    if (message.installedAppNames) {
      obj.installedAppNames = message.installedAppNames.map((e) => e);
    } else {
      obj.installedAppNames = [];
    }
    message.bundleId !== undefined && (obj.bundleId = message.bundleId);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdaRunAppParam>, I>>(object: I): DcIdaRunAppParam {
    const message = createBaseDcIdaRunAppParam();
    message.appPath = object.appPath ?? '';
    message.installedAppNames = object.installedAppNames?.map((e) => e) || [];
    message.bundleId = object.bundleId ?? '';
    return message;
  },
};

function createBaseDcIdaRunAppResult(): DcIdaRunAppResult {
  return { error: undefined };
}

export const DcIdaRunAppResult = {
  encode(message: DcIdaRunAppResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error !== undefined) {
      ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaRunAppResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdaRunAppResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.error = ErrorResult.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdaRunAppResult {
    return { error: isSet(object.error) ? ErrorResult.fromJSON(object.error) : undefined };
  },

  toJSON(message: DcIdaRunAppResult): unknown {
    const obj: any = {};
    message.error !== undefined && (obj.error = message.error ? ErrorResult.toJSON(message.error) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdaRunAppResult>, I>>(object: I): DcIdaRunAppResult {
    const message = createBaseDcIdaRunAppResult();
    message.error = object.error !== undefined && object.error !== null ? ErrorResult.fromPartial(object.error) : undefined;
    return message;
  },
};

function createBaseDcIdaGetSystemInfoParam(): DcIdaGetSystemInfoParam {
  return {};
}

export const DcIdaGetSystemInfoParam = {
  encode(_: DcIdaGetSystemInfoParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaGetSystemInfoParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdaGetSystemInfoParam();
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

  fromJSON(_: any): DcIdaGetSystemInfoParam {
    return {};
  },

  toJSON(_: DcIdaGetSystemInfoParam): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdaGetSystemInfoParam>, I>>(_: I): DcIdaGetSystemInfoParam {
    const message = createBaseDcIdaGetSystemInfoParam();
    return message;
  },
};

function createBaseDcIdaGetSystemInfoResult(): DcIdaGetSystemInfoResult {
  return { screenWidth: 0, screenHeight: 0 };
}

export const DcIdaGetSystemInfoResult = {
  encode(message: DcIdaGetSystemInfoResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.screenWidth !== 0) {
      writer.uint32(8).uint32(message.screenWidth);
    }
    if (message.screenHeight !== 0) {
      writer.uint32(16).uint32(message.screenHeight);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaGetSystemInfoResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdaGetSystemInfoResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.screenWidth = reader.uint32();
          break;
        case 2:
          message.screenHeight = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdaGetSystemInfoResult {
    return {
      screenWidth: isSet(object.screenWidth) ? Number(object.screenWidth) : 0,
      screenHeight: isSet(object.screenHeight) ? Number(object.screenHeight) : 0,
    };
  },

  toJSON(message: DcIdaGetSystemInfoResult): unknown {
    const obj: any = {};
    message.screenWidth !== undefined && (obj.screenWidth = Math.round(message.screenWidth));
    message.screenHeight !== undefined && (obj.screenHeight = Math.round(message.screenHeight));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdaGetSystemInfoResult>, I>>(object: I): DcIdaGetSystemInfoResult {
    const message = createBaseDcIdaGetSystemInfoResult();
    message.screenWidth = object.screenWidth ?? 0;
    message.screenHeight = object.screenHeight ?? 0;
    return message;
  },
};

function createBaseDcIdaIsPortListeningParam(): DcIdaIsPortListeningParam {
  return { port: 0 };
}

export const DcIdaIsPortListeningParam = {
  encode(message: DcIdaIsPortListeningParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.port !== 0) {
      writer.uint32(8).uint32(message.port);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaIsPortListeningParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdaIsPortListeningParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.port = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdaIsPortListeningParam {
    return { port: isSet(object.port) ? Number(object.port) : 0 };
  },

  toJSON(message: DcIdaIsPortListeningParam): unknown {
    const obj: any = {};
    message.port !== undefined && (obj.port = Math.round(message.port));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdaIsPortListeningParam>, I>>(object: I): DcIdaIsPortListeningParam {
    const message = createBaseDcIdaIsPortListeningParam();
    message.port = object.port ?? 0;
    return message;
  },
};

function createBaseDcIdaIsPortListeningResult(): DcIdaIsPortListeningResult {
  return { isListening: false };
}

export const DcIdaIsPortListeningResult = {
  encode(message: DcIdaIsPortListeningResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.isListening === true) {
      writer.uint32(8).bool(message.isListening);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaIsPortListeningResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdaIsPortListeningResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.isListening = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdaIsPortListeningResult {
    return { isListening: isSet(object.isListening) ? Boolean(object.isListening) : false };
  },

  toJSON(message: DcIdaIsPortListeningResult): unknown {
    const obj: any = {};
    message.isListening !== undefined && (obj.isListening = message.isListening);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdaIsPortListeningResult>, I>>(object: I): DcIdaIsPortListeningResult {
    const message = createBaseDcIdaIsPortListeningResult();
    message.isListening = object.isListening ?? false;
    return message;
  },
};

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
