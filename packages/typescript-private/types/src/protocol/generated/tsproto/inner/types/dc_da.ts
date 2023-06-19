/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { ProfileMethod } from '../../outer/profile/profile_method';
import { RuntimeInfo } from '../../outer/profile/runtime_info';
import { StreamingOption } from '../../outer/streaming/streaming';
import { DeviceControl } from './device_control';

export interface DcDaConnectionParam {
  version: string;
  nickname: string;
}

export interface DcDaConnectionReturn {}

export interface DcDaQueryProfileParam {
  profileMethods: ProfileMethod[];
}

export interface DcDaQueryProfileReturn {
  info: RuntimeInfo | undefined;
}

export interface DcDaApplyStreamingOptionParam {
  option: StreamingOption | undefined;
}

export interface DcDaApplyStreamingOptionReturn {}

export interface DcDaControlParam {
  control: DeviceControl | undefined;
}

export interface DcDaControlReturn {}

function createBaseDcDaConnectionParam(): DcDaConnectionParam {
  return { version: '', nickname: '' };
}

export const DcDaConnectionParam = {
  encode(message: DcDaConnectionParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.version !== '') {
      writer.uint32(10).string(message.version);
    }
    if (message.nickname !== '') {
      writer.uint32(18).string(message.nickname);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcDaConnectionParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcDaConnectionParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.version = reader.string();
          break;
        case 2:
          message.nickname = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcDaConnectionParam {
    return {
      version: isSet(object.version) ? String(object.version) : '',
      nickname: isSet(object.nickname) ? String(object.nickname) : '',
    };
  },

  toJSON(message: DcDaConnectionParam): unknown {
    const obj: any = {};
    message.version !== undefined && (obj.version = message.version);
    message.nickname !== undefined && (obj.nickname = message.nickname);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcDaConnectionParam>, I>>(object: I): DcDaConnectionParam {
    const message = createBaseDcDaConnectionParam();
    message.version = object.version ?? '';
    message.nickname = object.nickname ?? '';
    return message;
  },
};

function createBaseDcDaConnectionReturn(): DcDaConnectionReturn {
  return {};
}

export const DcDaConnectionReturn = {
  encode(_: DcDaConnectionReturn, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcDaConnectionReturn {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcDaConnectionReturn();
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

  fromJSON(_: any): DcDaConnectionReturn {
    return {};
  },

  toJSON(_: DcDaConnectionReturn): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcDaConnectionReturn>, I>>(_: I): DcDaConnectionReturn {
    const message = createBaseDcDaConnectionReturn();
    return message;
  },
};

function createBaseDcDaQueryProfileParam(): DcDaQueryProfileParam {
  return { profileMethods: [] };
}

export const DcDaQueryProfileParam = {
  encode(message: DcDaQueryProfileParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.profileMethods) {
      ProfileMethod.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcDaQueryProfileParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcDaQueryProfileParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.profileMethods.push(ProfileMethod.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcDaQueryProfileParam {
    return {
      profileMethods: Array.isArray(object?.profileMethods) ? object.profileMethods.map((e: any) => ProfileMethod.fromJSON(e)) : [],
    };
  },

  toJSON(message: DcDaQueryProfileParam): unknown {
    const obj: any = {};
    if (message.profileMethods) {
      obj.profileMethods = message.profileMethods.map((e) => (e ? ProfileMethod.toJSON(e) : undefined));
    } else {
      obj.profileMethods = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcDaQueryProfileParam>, I>>(object: I): DcDaQueryProfileParam {
    const message = createBaseDcDaQueryProfileParam();
    message.profileMethods = object.profileMethods?.map((e) => ProfileMethod.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDcDaQueryProfileReturn(): DcDaQueryProfileReturn {
  return { info: undefined };
}

export const DcDaQueryProfileReturn = {
  encode(message: DcDaQueryProfileReturn, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.info !== undefined) {
      RuntimeInfo.encode(message.info, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcDaQueryProfileReturn {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcDaQueryProfileReturn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.info = RuntimeInfo.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcDaQueryProfileReturn {
    return { info: isSet(object.info) ? RuntimeInfo.fromJSON(object.info) : undefined };
  },

  toJSON(message: DcDaQueryProfileReturn): unknown {
    const obj: any = {};
    message.info !== undefined && (obj.info = message.info ? RuntimeInfo.toJSON(message.info) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcDaQueryProfileReturn>, I>>(object: I): DcDaQueryProfileReturn {
    const message = createBaseDcDaQueryProfileReturn();
    message.info = object.info !== undefined && object.info !== null ? RuntimeInfo.fromPartial(object.info) : undefined;
    return message;
  },
};

function createBaseDcDaApplyStreamingOptionParam(): DcDaApplyStreamingOptionParam {
  return { option: undefined };
}

export const DcDaApplyStreamingOptionParam = {
  encode(message: DcDaApplyStreamingOptionParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.option !== undefined) {
      StreamingOption.encode(message.option, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcDaApplyStreamingOptionParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcDaApplyStreamingOptionParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.option = StreamingOption.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcDaApplyStreamingOptionParam {
    return { option: isSet(object.option) ? StreamingOption.fromJSON(object.option) : undefined };
  },

  toJSON(message: DcDaApplyStreamingOptionParam): unknown {
    const obj: any = {};
    message.option !== undefined && (obj.option = message.option ? StreamingOption.toJSON(message.option) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcDaApplyStreamingOptionParam>, I>>(object: I): DcDaApplyStreamingOptionParam {
    const message = createBaseDcDaApplyStreamingOptionParam();
    message.option = object.option !== undefined && object.option !== null ? StreamingOption.fromPartial(object.option) : undefined;
    return message;
  },
};

function createBaseDcDaApplyStreamingOptionReturn(): DcDaApplyStreamingOptionReturn {
  return {};
}

export const DcDaApplyStreamingOptionReturn = {
  encode(_: DcDaApplyStreamingOptionReturn, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcDaApplyStreamingOptionReturn {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcDaApplyStreamingOptionReturn();
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

  fromJSON(_: any): DcDaApplyStreamingOptionReturn {
    return {};
  },

  toJSON(_: DcDaApplyStreamingOptionReturn): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcDaApplyStreamingOptionReturn>, I>>(_: I): DcDaApplyStreamingOptionReturn {
    const message = createBaseDcDaApplyStreamingOptionReturn();
    return message;
  },
};

function createBaseDcDaControlParam(): DcDaControlParam {
  return { control: undefined };
}

export const DcDaControlParam = {
  encode(message: DcDaControlParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.control !== undefined) {
      DeviceControl.encode(message.control, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcDaControlParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcDaControlParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.control = DeviceControl.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcDaControlParam {
    return { control: isSet(object.control) ? DeviceControl.fromJSON(object.control) : undefined };
  },

  toJSON(message: DcDaControlParam): unknown {
    const obj: any = {};
    message.control !== undefined && (obj.control = message.control ? DeviceControl.toJSON(message.control) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcDaControlParam>, I>>(object: I): DcDaControlParam {
    const message = createBaseDcDaControlParam();
    message.control = object.control !== undefined && object.control !== null ? DeviceControl.fromPartial(object.control) : undefined;
    return message;
  },
};

function createBaseDcDaControlReturn(): DcDaControlReturn {
  return {};
}

export const DcDaControlReturn = {
  encode(_: DcDaControlReturn, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcDaControlReturn {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcDaControlReturn();
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

  fromJSON(_: any): DcDaControlReturn {
    return {};
  },

  toJSON(_: DcDaControlReturn): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcDaControlReturn>, I>>(_: I): DcDaControlReturn {
    const message = createBaseDcDaControlReturn();
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
