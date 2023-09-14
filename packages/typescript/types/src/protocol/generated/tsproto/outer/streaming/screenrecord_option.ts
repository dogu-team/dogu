/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { ScreenCaptureOption } from './screencapture_option';

export interface ScreenRecordOption {
  screen: ScreenCaptureOption | undefined;
  filePath: string;
  pid?: number | undefined;
  etcParam?: string | undefined;
}

function createBaseScreenRecordOption(): ScreenRecordOption {
  return { screen: undefined, filePath: '', pid: undefined, etcParam: undefined };
}

export const ScreenRecordOption = {
  encode(message: ScreenRecordOption, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.screen !== undefined) {
      ScreenCaptureOption.encode(message.screen, writer.uint32(10).fork()).ldelim();
    }
    if (message.filePath !== '') {
      writer.uint32(18).string(message.filePath);
    }
    if (message.pid !== undefined) {
      writer.uint32(24).int32(message.pid);
    }
    if (message.etcParam !== undefined) {
      writer.uint32(82).string(message.etcParam);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ScreenRecordOption {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseScreenRecordOption();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.screen = ScreenCaptureOption.decode(reader, reader.uint32());
          break;
        case 2:
          message.filePath = reader.string();
          break;
        case 3:
          message.pid = reader.int32();
          break;
        case 10:
          message.etcParam = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ScreenRecordOption {
    return {
      screen: isSet(object.screen) ? ScreenCaptureOption.fromJSON(object.screen) : undefined,
      filePath: isSet(object.filePath) ? String(object.filePath) : '',
      pid: isSet(object.pid) ? Number(object.pid) : undefined,
      etcParam: isSet(object.etcParam) ? String(object.etcParam) : undefined,
    };
  },

  toJSON(message: ScreenRecordOption): unknown {
    const obj: any = {};
    message.screen !== undefined && (obj.screen = message.screen ? ScreenCaptureOption.toJSON(message.screen) : undefined);
    message.filePath !== undefined && (obj.filePath = message.filePath);
    message.pid !== undefined && (obj.pid = Math.round(message.pid));
    message.etcParam !== undefined && (obj.etcParam = message.etcParam);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ScreenRecordOption>, I>>(object: I): ScreenRecordOption {
    const message = createBaseScreenRecordOption();
    message.screen = object.screen !== undefined && object.screen !== null ? ScreenCaptureOption.fromPartial(object.screen) : undefined;
    message.filePath = object.filePath ?? '';
    message.pid = object.pid ?? undefined;
    message.etcParam = object.etcParam ?? undefined;
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
