/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { ErrorResult } from '../../outer/errors';
import { ScreenRecordOption } from '../../outer/streaming/screenrecord_option';
import { StreamingAnswer, StreamingOffer } from '../../outer/streaming/streaming';

export interface DcIdcStartStreamingParam {
  offer: StreamingOffer | undefined;
}

export interface DcIdcStartStreamingResult {
  answer: StreamingAnswer | undefined;
}

export interface DcIdcScanIdsParam {}

export interface DcIdcScanIdsResult {
  ids: string[];
}

export interface DcIdcOpenGrpcClientParam {
  serial: string;
  grpcHost: string;
  grpcPort: number;
}

export interface DcIdcOpenGrpcClientResult {}

export interface DcIdcCheckGrpcHealthParam {
  serial: string;
}

export interface DcIdcCheckGrpcHealthResult {}

export interface DcIdcStartScreenRecordParam {
  serial: string;
  option: ScreenRecordOption | undefined;
}

export interface DcIdcStartScreenRecordResult {
  error: ErrorResult | undefined;
}

export interface DcIdcStopScreenRecordParam {
  serial: string;
}

export interface DcIdcStopScreenRecordResult {
  error: ErrorResult | undefined;
  filePath: string;
}

function createBaseDcIdcStartStreamingParam(): DcIdcStartStreamingParam {
  return { offer: undefined };
}

export const DcIdcStartStreamingParam = {
  encode(message: DcIdcStartStreamingParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.offer !== undefined) {
      StreamingOffer.encode(message.offer, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcStartStreamingParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcStartStreamingParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.offer = StreamingOffer.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdcStartStreamingParam {
    return { offer: isSet(object.offer) ? StreamingOffer.fromJSON(object.offer) : undefined };
  },

  toJSON(message: DcIdcStartStreamingParam): unknown {
    const obj: any = {};
    message.offer !== undefined && (obj.offer = message.offer ? StreamingOffer.toJSON(message.offer) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcStartStreamingParam>, I>>(object: I): DcIdcStartStreamingParam {
    const message = createBaseDcIdcStartStreamingParam();
    message.offer = object.offer !== undefined && object.offer !== null ? StreamingOffer.fromPartial(object.offer) : undefined;
    return message;
  },
};

function createBaseDcIdcStartStreamingResult(): DcIdcStartStreamingResult {
  return { answer: undefined };
}

export const DcIdcStartStreamingResult = {
  encode(message: DcIdcStartStreamingResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.answer !== undefined) {
      StreamingAnswer.encode(message.answer, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcStartStreamingResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcStartStreamingResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.answer = StreamingAnswer.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdcStartStreamingResult {
    return { answer: isSet(object.answer) ? StreamingAnswer.fromJSON(object.answer) : undefined };
  },

  toJSON(message: DcIdcStartStreamingResult): unknown {
    const obj: any = {};
    message.answer !== undefined && (obj.answer = message.answer ? StreamingAnswer.toJSON(message.answer) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcStartStreamingResult>, I>>(object: I): DcIdcStartStreamingResult {
    const message = createBaseDcIdcStartStreamingResult();
    message.answer = object.answer !== undefined && object.answer !== null ? StreamingAnswer.fromPartial(object.answer) : undefined;
    return message;
  },
};

function createBaseDcIdcScanIdsParam(): DcIdcScanIdsParam {
  return {};
}

export const DcIdcScanIdsParam = {
  encode(_: DcIdcScanIdsParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcScanIdsParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcScanIdsParam();
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

  fromJSON(_: any): DcIdcScanIdsParam {
    return {};
  },

  toJSON(_: DcIdcScanIdsParam): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcScanIdsParam>, I>>(_: I): DcIdcScanIdsParam {
    const message = createBaseDcIdcScanIdsParam();
    return message;
  },
};

function createBaseDcIdcScanIdsResult(): DcIdcScanIdsResult {
  return { ids: [] };
}

export const DcIdcScanIdsResult = {
  encode(message: DcIdcScanIdsResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.ids) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcScanIdsResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcScanIdsResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ids.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdcScanIdsResult {
    return { ids: Array.isArray(object?.ids) ? object.ids.map((e: any) => String(e)) : [] };
  },

  toJSON(message: DcIdcScanIdsResult): unknown {
    const obj: any = {};
    if (message.ids) {
      obj.ids = message.ids.map((e) => e);
    } else {
      obj.ids = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcScanIdsResult>, I>>(object: I): DcIdcScanIdsResult {
    const message = createBaseDcIdcScanIdsResult();
    message.ids = object.ids?.map((e) => e) || [];
    return message;
  },
};

function createBaseDcIdcOpenGrpcClientParam(): DcIdcOpenGrpcClientParam {
  return { serial: '', grpcHost: '', grpcPort: 0 };
}

export const DcIdcOpenGrpcClientParam = {
  encode(message: DcIdcOpenGrpcClientParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.serial !== '') {
      writer.uint32(10).string(message.serial);
    }
    if (message.grpcHost !== '') {
      writer.uint32(18).string(message.grpcHost);
    }
    if (message.grpcPort !== 0) {
      writer.uint32(29).fixed32(message.grpcPort);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcOpenGrpcClientParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcOpenGrpcClientParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.serial = reader.string();
          break;
        case 2:
          message.grpcHost = reader.string();
          break;
        case 3:
          message.grpcPort = reader.fixed32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdcOpenGrpcClientParam {
    return {
      serial: isSet(object.serial) ? String(object.serial) : '',
      grpcHost: isSet(object.grpcHost) ? String(object.grpcHost) : '',
      grpcPort: isSet(object.grpcPort) ? Number(object.grpcPort) : 0,
    };
  },

  toJSON(message: DcIdcOpenGrpcClientParam): unknown {
    const obj: any = {};
    message.serial !== undefined && (obj.serial = message.serial);
    message.grpcHost !== undefined && (obj.grpcHost = message.grpcHost);
    message.grpcPort !== undefined && (obj.grpcPort = Math.round(message.grpcPort));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcOpenGrpcClientParam>, I>>(object: I): DcIdcOpenGrpcClientParam {
    const message = createBaseDcIdcOpenGrpcClientParam();
    message.serial = object.serial ?? '';
    message.grpcHost = object.grpcHost ?? '';
    message.grpcPort = object.grpcPort ?? 0;
    return message;
  },
};

function createBaseDcIdcOpenGrpcClientResult(): DcIdcOpenGrpcClientResult {
  return {};
}

export const DcIdcOpenGrpcClientResult = {
  encode(_: DcIdcOpenGrpcClientResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcOpenGrpcClientResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcOpenGrpcClientResult();
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

  fromJSON(_: any): DcIdcOpenGrpcClientResult {
    return {};
  },

  toJSON(_: DcIdcOpenGrpcClientResult): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcOpenGrpcClientResult>, I>>(_: I): DcIdcOpenGrpcClientResult {
    const message = createBaseDcIdcOpenGrpcClientResult();
    return message;
  },
};

function createBaseDcIdcCheckGrpcHealthParam(): DcIdcCheckGrpcHealthParam {
  return { serial: '' };
}

export const DcIdcCheckGrpcHealthParam = {
  encode(message: DcIdcCheckGrpcHealthParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.serial !== '') {
      writer.uint32(10).string(message.serial);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcCheckGrpcHealthParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcCheckGrpcHealthParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.serial = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdcCheckGrpcHealthParam {
    return { serial: isSet(object.serial) ? String(object.serial) : '' };
  },

  toJSON(message: DcIdcCheckGrpcHealthParam): unknown {
    const obj: any = {};
    message.serial !== undefined && (obj.serial = message.serial);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcCheckGrpcHealthParam>, I>>(object: I): DcIdcCheckGrpcHealthParam {
    const message = createBaseDcIdcCheckGrpcHealthParam();
    message.serial = object.serial ?? '';
    return message;
  },
};

function createBaseDcIdcCheckGrpcHealthResult(): DcIdcCheckGrpcHealthResult {
  return {};
}

export const DcIdcCheckGrpcHealthResult = {
  encode(_: DcIdcCheckGrpcHealthResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcCheckGrpcHealthResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcCheckGrpcHealthResult();
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

  fromJSON(_: any): DcIdcCheckGrpcHealthResult {
    return {};
  },

  toJSON(_: DcIdcCheckGrpcHealthResult): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcCheckGrpcHealthResult>, I>>(_: I): DcIdcCheckGrpcHealthResult {
    const message = createBaseDcIdcCheckGrpcHealthResult();
    return message;
  },
};

function createBaseDcIdcStartScreenRecordParam(): DcIdcStartScreenRecordParam {
  return { serial: '', option: undefined };
}

export const DcIdcStartScreenRecordParam = {
  encode(message: DcIdcStartScreenRecordParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.serial !== '') {
      writer.uint32(10).string(message.serial);
    }
    if (message.option !== undefined) {
      ScreenRecordOption.encode(message.option, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcStartScreenRecordParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcStartScreenRecordParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.serial = reader.string();
          break;
        case 2:
          message.option = ScreenRecordOption.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdcStartScreenRecordParam {
    return {
      serial: isSet(object.serial) ? String(object.serial) : '',
      option: isSet(object.option) ? ScreenRecordOption.fromJSON(object.option) : undefined,
    };
  },

  toJSON(message: DcIdcStartScreenRecordParam): unknown {
    const obj: any = {};
    message.serial !== undefined && (obj.serial = message.serial);
    message.option !== undefined && (obj.option = message.option ? ScreenRecordOption.toJSON(message.option) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcStartScreenRecordParam>, I>>(object: I): DcIdcStartScreenRecordParam {
    const message = createBaseDcIdcStartScreenRecordParam();
    message.serial = object.serial ?? '';
    message.option = object.option !== undefined && object.option !== null ? ScreenRecordOption.fromPartial(object.option) : undefined;
    return message;
  },
};

function createBaseDcIdcStartScreenRecordResult(): DcIdcStartScreenRecordResult {
  return { error: undefined };
}

export const DcIdcStartScreenRecordResult = {
  encode(message: DcIdcStartScreenRecordResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error !== undefined) {
      ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcStartScreenRecordResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcStartScreenRecordResult();
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

  fromJSON(object: any): DcIdcStartScreenRecordResult {
    return { error: isSet(object.error) ? ErrorResult.fromJSON(object.error) : undefined };
  },

  toJSON(message: DcIdcStartScreenRecordResult): unknown {
    const obj: any = {};
    message.error !== undefined && (obj.error = message.error ? ErrorResult.toJSON(message.error) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcStartScreenRecordResult>, I>>(object: I): DcIdcStartScreenRecordResult {
    const message = createBaseDcIdcStartScreenRecordResult();
    message.error = object.error !== undefined && object.error !== null ? ErrorResult.fromPartial(object.error) : undefined;
    return message;
  },
};

function createBaseDcIdcStopScreenRecordParam(): DcIdcStopScreenRecordParam {
  return { serial: '' };
}

export const DcIdcStopScreenRecordParam = {
  encode(message: DcIdcStopScreenRecordParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.serial !== '') {
      writer.uint32(10).string(message.serial);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcStopScreenRecordParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcStopScreenRecordParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.serial = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdcStopScreenRecordParam {
    return { serial: isSet(object.serial) ? String(object.serial) : '' };
  },

  toJSON(message: DcIdcStopScreenRecordParam): unknown {
    const obj: any = {};
    message.serial !== undefined && (obj.serial = message.serial);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcStopScreenRecordParam>, I>>(object: I): DcIdcStopScreenRecordParam {
    const message = createBaseDcIdcStopScreenRecordParam();
    message.serial = object.serial ?? '';
    return message;
  },
};

function createBaseDcIdcStopScreenRecordResult(): DcIdcStopScreenRecordResult {
  return { error: undefined, filePath: '' };
}

export const DcIdcStopScreenRecordResult = {
  encode(message: DcIdcStopScreenRecordResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error !== undefined) {
      ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
    }
    if (message.filePath !== '') {
      writer.uint32(18).string(message.filePath);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcStopScreenRecordResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcStopScreenRecordResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.error = ErrorResult.decode(reader, reader.uint32());
          break;
        case 2:
          message.filePath = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdcStopScreenRecordResult {
    return {
      error: isSet(object.error) ? ErrorResult.fromJSON(object.error) : undefined,
      filePath: isSet(object.filePath) ? String(object.filePath) : '',
    };
  },

  toJSON(message: DcIdcStopScreenRecordResult): unknown {
    const obj: any = {};
    message.error !== undefined && (obj.error = message.error ? ErrorResult.toJSON(message.error) : undefined);
    message.filePath !== undefined && (obj.filePath = message.filePath);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcStopScreenRecordResult>, I>>(object: I): DcIdcStopScreenRecordResult {
    const message = createBaseDcIdcStopScreenRecordResult();
    message.error = object.error !== undefined && object.error !== null ? ErrorResult.fromPartial(object.error) : undefined;
    message.filePath = object.filePath ?? '';
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
