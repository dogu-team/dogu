/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export interface ScreenCaptureOption {
  /**
   * (android): available
   * (ios): ignored
   */
  bitRate?: number | undefined;
  /**
   * (android): available
   * https://developer.android.com/reference/android/media/MediaFormat#KEY_MAX_FPS_TO_ENCODER
   *
   * (ios): ignored
   */
  maxFps?: number | undefined;
  /**
   * (android): available
   * https://developer.android.com/reference/android/media/MediaFormat#KEY_FRAME_RATE
   *
   * (ios): ignored
   */
  frameRate?: number | undefined;
  /**
   * (android): available
   * https://developer.android.com/reference/android/media/MediaFormat#KEY_I_FRAME_INTERVAL
   *
   * (ios): ignored
   */
  frameInterval?: number | undefined;
  /**
   * (android): available
   * https://developer.android.com/reference/android/media/MediaFormat#KEY_REPEAT_PREVIOUS_FRAME_AFTER
   *
   * (ios): ignored
   */
  repeatFrameDelay?: number | undefined;
  /**
   * (android): available
   * Currently processed as height value among width x height
   * ex) 1920, 1600, 1280, 1024, 800, 640, 320
   *
   * (ios): available
   * In the case of iOS, the device changes to the available resolution preset
   * according to the input value. 2160 <= max_resolution        -> 3840x2160
   * 1080 <= max_resolution < 2160 -> 1920x1080
   *  720 <= max_resolution < 1080 -> 1280x720
   * ...                           -> 960x540
   * ...                           -> 640x480
   * ...                           -> 352x288
   * ...                           -> 320x240
   */
  maxResolution?: number | undefined;
  /**
   * Used for desktop platform
   * If pid paaed. capture pid's window
   */
  pid?: number | undefined;
}

function createBaseScreenCaptureOption(): ScreenCaptureOption {
  return {
    bitRate: undefined,
    maxFps: undefined,
    frameRate: undefined,
    frameInterval: undefined,
    repeatFrameDelay: undefined,
    maxResolution: undefined,
    pid: undefined,
  };
}

export const ScreenCaptureOption = {
  encode(message: ScreenCaptureOption, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bitRate !== undefined) {
      writer.uint32(9).fixed64(message.bitRate);
    }
    if (message.maxFps !== undefined) {
      writer.uint32(17).fixed64(message.maxFps);
    }
    if (message.frameRate !== undefined) {
      writer.uint32(25).fixed64(message.frameRate);
    }
    if (message.frameInterval !== undefined) {
      writer.uint32(33).fixed64(message.frameInterval);
    }
    if (message.repeatFrameDelay !== undefined) {
      writer.uint32(41).fixed64(message.repeatFrameDelay);
    }
    if (message.maxResolution !== undefined) {
      writer.uint32(53).fixed32(message.maxResolution);
    }
    if (message.pid !== undefined) {
      writer.uint32(56).int32(message.pid);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ScreenCaptureOption {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseScreenCaptureOption();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.bitRate = longToNumber(reader.fixed64() as Long);
          break;
        case 2:
          message.maxFps = longToNumber(reader.fixed64() as Long);
          break;
        case 3:
          message.frameRate = longToNumber(reader.fixed64() as Long);
          break;
        case 4:
          message.frameInterval = longToNumber(reader.fixed64() as Long);
          break;
        case 5:
          message.repeatFrameDelay = longToNumber(reader.fixed64() as Long);
          break;
        case 6:
          message.maxResolution = reader.fixed32();
          break;
        case 7:
          message.pid = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ScreenCaptureOption {
    return {
      bitRate: isSet(object.bitRate) ? Number(object.bitRate) : undefined,
      maxFps: isSet(object.maxFps) ? Number(object.maxFps) : undefined,
      frameRate: isSet(object.frameRate) ? Number(object.frameRate) : undefined,
      frameInterval: isSet(object.frameInterval) ? Number(object.frameInterval) : undefined,
      repeatFrameDelay: isSet(object.repeatFrameDelay) ? Number(object.repeatFrameDelay) : undefined,
      maxResolution: isSet(object.maxResolution) ? Number(object.maxResolution) : undefined,
      pid: isSet(object.pid) ? Number(object.pid) : undefined,
    };
  },

  toJSON(message: ScreenCaptureOption): unknown {
    const obj: any = {};
    message.bitRate !== undefined && (obj.bitRate = Math.round(message.bitRate));
    message.maxFps !== undefined && (obj.maxFps = Math.round(message.maxFps));
    message.frameRate !== undefined && (obj.frameRate = Math.round(message.frameRate));
    message.frameInterval !== undefined && (obj.frameInterval = Math.round(message.frameInterval));
    message.repeatFrameDelay !== undefined && (obj.repeatFrameDelay = Math.round(message.repeatFrameDelay));
    message.maxResolution !== undefined && (obj.maxResolution = Math.round(message.maxResolution));
    message.pid !== undefined && (obj.pid = Math.round(message.pid));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ScreenCaptureOption>, I>>(object: I): ScreenCaptureOption {
    const message = createBaseScreenCaptureOption();
    message.bitRate = object.bitRate ?? undefined;
    message.maxFps = object.maxFps ?? undefined;
    message.frameRate = object.frameRate ?? undefined;
    message.frameInterval = object.frameInterval ?? undefined;
    message.repeatFrameDelay = object.repeatFrameDelay ?? undefined;
    message.maxResolution = object.maxResolution ?? undefined;
    message.pid = object.pid ?? undefined;
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

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER');
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
