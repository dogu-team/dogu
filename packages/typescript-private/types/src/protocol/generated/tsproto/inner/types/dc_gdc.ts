/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { ErrorResult } from '../../outer/errors';
import { Platform, platformFromJSON, platformToJSON } from '../../outer/platform';
import { ScreenRecordOption } from '../../outer/streaming/screenrecord_option';
import { StreamingAnswer, StreamingOffer } from '../../outer/streaming/streaming';

export interface DcGdcDeviceContext {
  serial: string;
  platform: Platform;
  screenUrl: string;
  inputUrl: string;
  screenWidth: number;
  screenHeight: number;
}

export interface DcGdcUpdateDeviceListParam {
  devices: DcGdcDeviceContext[];
}

export interface DcGdcUpdateDeviceListResult {}

export interface DcGdcStartStreamingParam {
  offer: StreamingOffer | undefined;
}

export interface DcGdcStartStreamingResult {
  answer: StreamingAnswer | undefined;
}

export interface DcGdcStopStreamingParam {
  serial: string;
}

export interface DcGdcStopStreamingResult {}

export interface DcGdcStartScreenRecordParam {
  serial: string;
  option: ScreenRecordOption | undefined;
}

export interface DcGdcStartScreenRecordResult {
  error: ErrorResult | undefined;
}

export interface DcGdcStopScreenRecordParam {
  serial: string;
  filePath: string;
}

export interface DcGdcStopScreenRecordResult {
  error: ErrorResult | undefined;
  filePath: string;
}

export interface DcGdcGetSurfaceStatusParam {
  serial: string;
}

export interface DcGdcGetSurfaceStatusResult {
  hasSurface: boolean;
  isPlaying: boolean;
  lastFrameDeltaMillisec: number;
}

function createBaseDcGdcDeviceContext(): DcGdcDeviceContext {
  return { serial: '', platform: 0, screenUrl: '', inputUrl: '', screenWidth: 0, screenHeight: 0 };
}

export const DcGdcDeviceContext = {
  encode(message: DcGdcDeviceContext, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.serial !== '') {
      writer.uint32(10).string(message.serial);
    }
    if (message.platform !== 0) {
      writer.uint32(16).int32(message.platform);
    }
    if (message.screenUrl !== '') {
      writer.uint32(26).string(message.screenUrl);
    }
    if (message.inputUrl !== '') {
      writer.uint32(34).string(message.inputUrl);
    }
    if (message.screenWidth !== 0) {
      writer.uint32(240).uint32(message.screenWidth);
    }
    if (message.screenHeight !== 0) {
      writer.uint32(248).uint32(message.screenHeight);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcDeviceContext {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcDeviceContext();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.serial = reader.string();
          break;
        case 2:
          message.platform = reader.int32() as any;
          break;
        case 3:
          message.screenUrl = reader.string();
          break;
        case 4:
          message.inputUrl = reader.string();
          break;
        case 30:
          message.screenWidth = reader.uint32();
          break;
        case 31:
          message.screenHeight = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcGdcDeviceContext {
    return {
      serial: isSet(object.serial) ? String(object.serial) : '',
      platform: isSet(object.platform) ? platformFromJSON(object.platform) : 0,
      screenUrl: isSet(object.screenUrl) ? String(object.screenUrl) : '',
      inputUrl: isSet(object.inputUrl) ? String(object.inputUrl) : '',
      screenWidth: isSet(object.screenWidth) ? Number(object.screenWidth) : 0,
      screenHeight: isSet(object.screenHeight) ? Number(object.screenHeight) : 0,
    };
  },

  toJSON(message: DcGdcDeviceContext): unknown {
    const obj: any = {};
    message.serial !== undefined && (obj.serial = message.serial);
    message.platform !== undefined && (obj.platform = platformToJSON(message.platform));
    message.screenUrl !== undefined && (obj.screenUrl = message.screenUrl);
    message.inputUrl !== undefined && (obj.inputUrl = message.inputUrl);
    message.screenWidth !== undefined && (obj.screenWidth = Math.round(message.screenWidth));
    message.screenHeight !== undefined && (obj.screenHeight = Math.round(message.screenHeight));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcDeviceContext>, I>>(object: I): DcGdcDeviceContext {
    const message = createBaseDcGdcDeviceContext();
    message.serial = object.serial ?? '';
    message.platform = object.platform ?? 0;
    message.screenUrl = object.screenUrl ?? '';
    message.inputUrl = object.inputUrl ?? '';
    message.screenWidth = object.screenWidth ?? 0;
    message.screenHeight = object.screenHeight ?? 0;
    return message;
  },
};

function createBaseDcGdcUpdateDeviceListParam(): DcGdcUpdateDeviceListParam {
  return { devices: [] };
}

export const DcGdcUpdateDeviceListParam = {
  encode(message: DcGdcUpdateDeviceListParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.devices) {
      DcGdcDeviceContext.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcUpdateDeviceListParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcUpdateDeviceListParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.devices.push(DcGdcDeviceContext.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcGdcUpdateDeviceListParam {
    return {
      devices: Array.isArray(object?.devices) ? object.devices.map((e: any) => DcGdcDeviceContext.fromJSON(e)) : [],
    };
  },

  toJSON(message: DcGdcUpdateDeviceListParam): unknown {
    const obj: any = {};
    if (message.devices) {
      obj.devices = message.devices.map((e) => (e ? DcGdcDeviceContext.toJSON(e) : undefined));
    } else {
      obj.devices = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcUpdateDeviceListParam>, I>>(object: I): DcGdcUpdateDeviceListParam {
    const message = createBaseDcGdcUpdateDeviceListParam();
    message.devices = object.devices?.map((e) => DcGdcDeviceContext.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDcGdcUpdateDeviceListResult(): DcGdcUpdateDeviceListResult {
  return {};
}

export const DcGdcUpdateDeviceListResult = {
  encode(_: DcGdcUpdateDeviceListResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcUpdateDeviceListResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcUpdateDeviceListResult();
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

  fromJSON(_: any): DcGdcUpdateDeviceListResult {
    return {};
  },

  toJSON(_: DcGdcUpdateDeviceListResult): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcUpdateDeviceListResult>, I>>(_: I): DcGdcUpdateDeviceListResult {
    const message = createBaseDcGdcUpdateDeviceListResult();
    return message;
  },
};

function createBaseDcGdcStartStreamingParam(): DcGdcStartStreamingParam {
  return { offer: undefined };
}

export const DcGdcStartStreamingParam = {
  encode(message: DcGdcStartStreamingParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.offer !== undefined) {
      StreamingOffer.encode(message.offer, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStartStreamingParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcStartStreamingParam();
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

  fromJSON(object: any): DcGdcStartStreamingParam {
    return { offer: isSet(object.offer) ? StreamingOffer.fromJSON(object.offer) : undefined };
  },

  toJSON(message: DcGdcStartStreamingParam): unknown {
    const obj: any = {};
    message.offer !== undefined && (obj.offer = message.offer ? StreamingOffer.toJSON(message.offer) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcStartStreamingParam>, I>>(object: I): DcGdcStartStreamingParam {
    const message = createBaseDcGdcStartStreamingParam();
    message.offer = object.offer !== undefined && object.offer !== null ? StreamingOffer.fromPartial(object.offer) : undefined;
    return message;
  },
};

function createBaseDcGdcStartStreamingResult(): DcGdcStartStreamingResult {
  return { answer: undefined };
}

export const DcGdcStartStreamingResult = {
  encode(message: DcGdcStartStreamingResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.answer !== undefined) {
      StreamingAnswer.encode(message.answer, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStartStreamingResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcStartStreamingResult();
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

  fromJSON(object: any): DcGdcStartStreamingResult {
    return { answer: isSet(object.answer) ? StreamingAnswer.fromJSON(object.answer) : undefined };
  },

  toJSON(message: DcGdcStartStreamingResult): unknown {
    const obj: any = {};
    message.answer !== undefined && (obj.answer = message.answer ? StreamingAnswer.toJSON(message.answer) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcStartStreamingResult>, I>>(object: I): DcGdcStartStreamingResult {
    const message = createBaseDcGdcStartStreamingResult();
    message.answer = object.answer !== undefined && object.answer !== null ? StreamingAnswer.fromPartial(object.answer) : undefined;
    return message;
  },
};

function createBaseDcGdcStopStreamingParam(): DcGdcStopStreamingParam {
  return { serial: '' };
}

export const DcGdcStopStreamingParam = {
  encode(message: DcGdcStopStreamingParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.serial !== '') {
      writer.uint32(10).string(message.serial);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStopStreamingParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcStopStreamingParam();
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

  fromJSON(object: any): DcGdcStopStreamingParam {
    return { serial: isSet(object.serial) ? String(object.serial) : '' };
  },

  toJSON(message: DcGdcStopStreamingParam): unknown {
    const obj: any = {};
    message.serial !== undefined && (obj.serial = message.serial);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcStopStreamingParam>, I>>(object: I): DcGdcStopStreamingParam {
    const message = createBaseDcGdcStopStreamingParam();
    message.serial = object.serial ?? '';
    return message;
  },
};

function createBaseDcGdcStopStreamingResult(): DcGdcStopStreamingResult {
  return {};
}

export const DcGdcStopStreamingResult = {
  encode(_: DcGdcStopStreamingResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStopStreamingResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcStopStreamingResult();
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

  fromJSON(_: any): DcGdcStopStreamingResult {
    return {};
  },

  toJSON(_: DcGdcStopStreamingResult): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcStopStreamingResult>, I>>(_: I): DcGdcStopStreamingResult {
    const message = createBaseDcGdcStopStreamingResult();
    return message;
  },
};

function createBaseDcGdcStartScreenRecordParam(): DcGdcStartScreenRecordParam {
  return { serial: '', option: undefined };
}

export const DcGdcStartScreenRecordParam = {
  encode(message: DcGdcStartScreenRecordParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.serial !== '') {
      writer.uint32(10).string(message.serial);
    }
    if (message.option !== undefined) {
      ScreenRecordOption.encode(message.option, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStartScreenRecordParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcStartScreenRecordParam();
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

  fromJSON(object: any): DcGdcStartScreenRecordParam {
    return {
      serial: isSet(object.serial) ? String(object.serial) : '',
      option: isSet(object.option) ? ScreenRecordOption.fromJSON(object.option) : undefined,
    };
  },

  toJSON(message: DcGdcStartScreenRecordParam): unknown {
    const obj: any = {};
    message.serial !== undefined && (obj.serial = message.serial);
    message.option !== undefined && (obj.option = message.option ? ScreenRecordOption.toJSON(message.option) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcStartScreenRecordParam>, I>>(object: I): DcGdcStartScreenRecordParam {
    const message = createBaseDcGdcStartScreenRecordParam();
    message.serial = object.serial ?? '';
    message.option = object.option !== undefined && object.option !== null ? ScreenRecordOption.fromPartial(object.option) : undefined;
    return message;
  },
};

function createBaseDcGdcStartScreenRecordResult(): DcGdcStartScreenRecordResult {
  return { error: undefined };
}

export const DcGdcStartScreenRecordResult = {
  encode(message: DcGdcStartScreenRecordResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error !== undefined) {
      ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStartScreenRecordResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcStartScreenRecordResult();
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

  fromJSON(object: any): DcGdcStartScreenRecordResult {
    return { error: isSet(object.error) ? ErrorResult.fromJSON(object.error) : undefined };
  },

  toJSON(message: DcGdcStartScreenRecordResult): unknown {
    const obj: any = {};
    message.error !== undefined && (obj.error = message.error ? ErrorResult.toJSON(message.error) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcStartScreenRecordResult>, I>>(object: I): DcGdcStartScreenRecordResult {
    const message = createBaseDcGdcStartScreenRecordResult();
    message.error = object.error !== undefined && object.error !== null ? ErrorResult.fromPartial(object.error) : undefined;
    return message;
  },
};

function createBaseDcGdcStopScreenRecordParam(): DcGdcStopScreenRecordParam {
  return { serial: '', filePath: '' };
}

export const DcGdcStopScreenRecordParam = {
  encode(message: DcGdcStopScreenRecordParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.serial !== '') {
      writer.uint32(10).string(message.serial);
    }
    if (message.filePath !== '') {
      writer.uint32(18).string(message.filePath);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStopScreenRecordParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcStopScreenRecordParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.serial = reader.string();
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

  fromJSON(object: any): DcGdcStopScreenRecordParam {
    return {
      serial: isSet(object.serial) ? String(object.serial) : '',
      filePath: isSet(object.filePath) ? String(object.filePath) : '',
    };
  },

  toJSON(message: DcGdcStopScreenRecordParam): unknown {
    const obj: any = {};
    message.serial !== undefined && (obj.serial = message.serial);
    message.filePath !== undefined && (obj.filePath = message.filePath);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcStopScreenRecordParam>, I>>(object: I): DcGdcStopScreenRecordParam {
    const message = createBaseDcGdcStopScreenRecordParam();
    message.serial = object.serial ?? '';
    message.filePath = object.filePath ?? '';
    return message;
  },
};

function createBaseDcGdcStopScreenRecordResult(): DcGdcStopScreenRecordResult {
  return { error: undefined, filePath: '' };
}

export const DcGdcStopScreenRecordResult = {
  encode(message: DcGdcStopScreenRecordResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error !== undefined) {
      ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
    }
    if (message.filePath !== '') {
      writer.uint32(18).string(message.filePath);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStopScreenRecordResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcStopScreenRecordResult();
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

  fromJSON(object: any): DcGdcStopScreenRecordResult {
    return {
      error: isSet(object.error) ? ErrorResult.fromJSON(object.error) : undefined,
      filePath: isSet(object.filePath) ? String(object.filePath) : '',
    };
  },

  toJSON(message: DcGdcStopScreenRecordResult): unknown {
    const obj: any = {};
    message.error !== undefined && (obj.error = message.error ? ErrorResult.toJSON(message.error) : undefined);
    message.filePath !== undefined && (obj.filePath = message.filePath);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcStopScreenRecordResult>, I>>(object: I): DcGdcStopScreenRecordResult {
    const message = createBaseDcGdcStopScreenRecordResult();
    message.error = object.error !== undefined && object.error !== null ? ErrorResult.fromPartial(object.error) : undefined;
    message.filePath = object.filePath ?? '';
    return message;
  },
};

function createBaseDcGdcGetSurfaceStatusParam(): DcGdcGetSurfaceStatusParam {
  return { serial: '' };
}

export const DcGdcGetSurfaceStatusParam = {
  encode(message: DcGdcGetSurfaceStatusParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.serial !== '') {
      writer.uint32(10).string(message.serial);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcGetSurfaceStatusParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcGetSurfaceStatusParam();
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

  fromJSON(object: any): DcGdcGetSurfaceStatusParam {
    return { serial: isSet(object.serial) ? String(object.serial) : '' };
  },

  toJSON(message: DcGdcGetSurfaceStatusParam): unknown {
    const obj: any = {};
    message.serial !== undefined && (obj.serial = message.serial);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcGetSurfaceStatusParam>, I>>(object: I): DcGdcGetSurfaceStatusParam {
    const message = createBaseDcGdcGetSurfaceStatusParam();
    message.serial = object.serial ?? '';
    return message;
  },
};

function createBaseDcGdcGetSurfaceStatusResult(): DcGdcGetSurfaceStatusResult {
  return { hasSurface: false, isPlaying: false, lastFrameDeltaMillisec: 0 };
}

export const DcGdcGetSurfaceStatusResult = {
  encode(message: DcGdcGetSurfaceStatusResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.hasSurface === true) {
      writer.uint32(8).bool(message.hasSurface);
    }
    if (message.isPlaying === true) {
      writer.uint32(16).bool(message.isPlaying);
    }
    if (message.lastFrameDeltaMillisec !== 0) {
      writer.uint32(24).uint32(message.lastFrameDeltaMillisec);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcGetSurfaceStatusResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcGetSurfaceStatusResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hasSurface = reader.bool();
          break;
        case 2:
          message.isPlaying = reader.bool();
          break;
        case 3:
          message.lastFrameDeltaMillisec = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcGdcGetSurfaceStatusResult {
    return {
      hasSurface: isSet(object.hasSurface) ? Boolean(object.hasSurface) : false,
      isPlaying: isSet(object.isPlaying) ? Boolean(object.isPlaying) : false,
      lastFrameDeltaMillisec: isSet(object.lastFrameDeltaMillisec) ? Number(object.lastFrameDeltaMillisec) : 0,
    };
  },

  toJSON(message: DcGdcGetSurfaceStatusResult): unknown {
    const obj: any = {};
    message.hasSurface !== undefined && (obj.hasSurface = message.hasSurface);
    message.isPlaying !== undefined && (obj.isPlaying = message.isPlaying);
    message.lastFrameDeltaMillisec !== undefined && (obj.lastFrameDeltaMillisec = Math.round(message.lastFrameDeltaMillisec));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcGetSurfaceStatusResult>, I>>(object: I): DcGdcGetSurfaceStatusResult {
    const message = createBaseDcGdcGetSurfaceStatusResult();
    message.hasSurface = object.hasSurface ?? false;
    message.isPlaying = object.isPlaying ?? false;
    message.lastFrameDeltaMillisec = object.lastFrameDeltaMillisec ?? 0;
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
