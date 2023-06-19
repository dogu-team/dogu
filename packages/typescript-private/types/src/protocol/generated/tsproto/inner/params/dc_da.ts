/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import {
  DcDaApplyStreamingOptionParam,
  DcDaApplyStreamingOptionReturn,
  DcDaConnectionParam,
  DcDaConnectionReturn,
  DcDaControlParam,
  DcDaControlReturn,
  DcDaQueryProfileParam,
  DcDaQueryProfileReturn,
} from '../types/dc_da';

export interface DcDaParam {
  seq: number;
  value?:
    | { $case: 'dcDaConnectionParam'; dcDaConnectionParam: DcDaConnectionParam }
    | { $case: 'dcDaQueryProfileParam'; dcDaQueryProfileParam: DcDaQueryProfileParam }
    | { $case: 'dcDaApplyStreamingOptionParam'; dcDaApplyStreamingOptionParam: DcDaApplyStreamingOptionParam }
    | { $case: 'dcDaControlParam'; dcDaControlParam: DcDaControlParam };
}

export interface DcDaReturn {
  seq: number;
  value?:
    | { $case: 'dcDaConnectionReturn'; dcDaConnectionReturn: DcDaConnectionReturn }
    | { $case: 'dcDaQueryProfileReturn'; dcDaQueryProfileReturn: DcDaQueryProfileReturn }
    | { $case: 'dcDaApplyStreamingOptionReturn'; dcDaApplyStreamingOptionReturn: DcDaApplyStreamingOptionReturn }
    | { $case: 'dcDaControlReturn'; dcDaControlReturn: DcDaControlReturn };
}

function createBaseDcDaParam(): DcDaParam {
  return { seq: 0, value: undefined };
}

export const DcDaParam = {
  encode(message: DcDaParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.seq !== 0) {
      writer.uint32(13).fixed32(message.seq);
    }
    if (message.value?.$case === 'dcDaConnectionParam') {
      DcDaConnectionParam.encode(message.value.dcDaConnectionParam, writer.uint32(18).fork()).ldelim();
    }
    if (message.value?.$case === 'dcDaQueryProfileParam') {
      DcDaQueryProfileParam.encode(message.value.dcDaQueryProfileParam, writer.uint32(26).fork()).ldelim();
    }
    if (message.value?.$case === 'dcDaApplyStreamingOptionParam') {
      DcDaApplyStreamingOptionParam.encode(message.value.dcDaApplyStreamingOptionParam, writer.uint32(34).fork()).ldelim();
    }
    if (message.value?.$case === 'dcDaControlParam') {
      DcDaControlParam.encode(message.value.dcDaControlParam, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcDaParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcDaParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.seq = reader.fixed32();
          break;
        case 2:
          message.value = {
            $case: 'dcDaConnectionParam',
            dcDaConnectionParam: DcDaConnectionParam.decode(reader, reader.uint32()),
          };
          break;
        case 3:
          message.value = {
            $case: 'dcDaQueryProfileParam',
            dcDaQueryProfileParam: DcDaQueryProfileParam.decode(reader, reader.uint32()),
          };
          break;
        case 4:
          message.value = {
            $case: 'dcDaApplyStreamingOptionParam',
            dcDaApplyStreamingOptionParam: DcDaApplyStreamingOptionParam.decode(reader, reader.uint32()),
          };
          break;
        case 5:
          message.value = {
            $case: 'dcDaControlParam',
            dcDaControlParam: DcDaControlParam.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcDaParam {
    return {
      seq: isSet(object.seq) ? Number(object.seq) : 0,
      value: isSet(object.dcDaConnectionParam)
        ? {
            $case: 'dcDaConnectionParam',
            dcDaConnectionParam: DcDaConnectionParam.fromJSON(object.dcDaConnectionParam),
          }
        : isSet(object.dcDaQueryProfileParam)
        ? {
            $case: 'dcDaQueryProfileParam',
            dcDaQueryProfileParam: DcDaQueryProfileParam.fromJSON(object.dcDaQueryProfileParam),
          }
        : isSet(object.dcDaApplyStreamingOptionParam)
        ? {
            $case: 'dcDaApplyStreamingOptionParam',
            dcDaApplyStreamingOptionParam: DcDaApplyStreamingOptionParam.fromJSON(object.dcDaApplyStreamingOptionParam),
          }
        : isSet(object.dcDaControlParam)
        ? { $case: 'dcDaControlParam', dcDaControlParam: DcDaControlParam.fromJSON(object.dcDaControlParam) }
        : undefined,
    };
  },

  toJSON(message: DcDaParam): unknown {
    const obj: any = {};
    message.seq !== undefined && (obj.seq = Math.round(message.seq));
    message.value?.$case === 'dcDaConnectionParam' &&
      (obj.dcDaConnectionParam = message.value?.dcDaConnectionParam ? DcDaConnectionParam.toJSON(message.value?.dcDaConnectionParam) : undefined);
    message.value?.$case === 'dcDaQueryProfileParam' &&
      (obj.dcDaQueryProfileParam = message.value?.dcDaQueryProfileParam ? DcDaQueryProfileParam.toJSON(message.value?.dcDaQueryProfileParam) : undefined);
    message.value?.$case === 'dcDaApplyStreamingOptionParam' &&
      (obj.dcDaApplyStreamingOptionParam = message.value?.dcDaApplyStreamingOptionParam
        ? DcDaApplyStreamingOptionParam.toJSON(message.value?.dcDaApplyStreamingOptionParam)
        : undefined);
    message.value?.$case === 'dcDaControlParam' && (obj.dcDaControlParam = message.value?.dcDaControlParam ? DcDaControlParam.toJSON(message.value?.dcDaControlParam) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcDaParam>, I>>(object: I): DcDaParam {
    const message = createBaseDcDaParam();
    message.seq = object.seq ?? 0;
    if (object.value?.$case === 'dcDaConnectionParam' && object.value?.dcDaConnectionParam !== undefined && object.value?.dcDaConnectionParam !== null) {
      message.value = {
        $case: 'dcDaConnectionParam',
        dcDaConnectionParam: DcDaConnectionParam.fromPartial(object.value.dcDaConnectionParam),
      };
    }
    if (object.value?.$case === 'dcDaQueryProfileParam' && object.value?.dcDaQueryProfileParam !== undefined && object.value?.dcDaQueryProfileParam !== null) {
      message.value = {
        $case: 'dcDaQueryProfileParam',
        dcDaQueryProfileParam: DcDaQueryProfileParam.fromPartial(object.value.dcDaQueryProfileParam),
      };
    }
    if (
      object.value?.$case === 'dcDaApplyStreamingOptionParam' &&
      object.value?.dcDaApplyStreamingOptionParam !== undefined &&
      object.value?.dcDaApplyStreamingOptionParam !== null
    ) {
      message.value = {
        $case: 'dcDaApplyStreamingOptionParam',
        dcDaApplyStreamingOptionParam: DcDaApplyStreamingOptionParam.fromPartial(object.value.dcDaApplyStreamingOptionParam),
      };
    }
    if (object.value?.$case === 'dcDaControlParam' && object.value?.dcDaControlParam !== undefined && object.value?.dcDaControlParam !== null) {
      message.value = {
        $case: 'dcDaControlParam',
        dcDaControlParam: DcDaControlParam.fromPartial(object.value.dcDaControlParam),
      };
    }
    return message;
  },
};

function createBaseDcDaReturn(): DcDaReturn {
  return { seq: 0, value: undefined };
}

export const DcDaReturn = {
  encode(message: DcDaReturn, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.seq !== 0) {
      writer.uint32(13).fixed32(message.seq);
    }
    if (message.value?.$case === 'dcDaConnectionReturn') {
      DcDaConnectionReturn.encode(message.value.dcDaConnectionReturn, writer.uint32(18).fork()).ldelim();
    }
    if (message.value?.$case === 'dcDaQueryProfileReturn') {
      DcDaQueryProfileReturn.encode(message.value.dcDaQueryProfileReturn, writer.uint32(26).fork()).ldelim();
    }
    if (message.value?.$case === 'dcDaApplyStreamingOptionReturn') {
      DcDaApplyStreamingOptionReturn.encode(message.value.dcDaApplyStreamingOptionReturn, writer.uint32(34).fork()).ldelim();
    }
    if (message.value?.$case === 'dcDaControlReturn') {
      DcDaControlReturn.encode(message.value.dcDaControlReturn, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcDaReturn {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcDaReturn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.seq = reader.fixed32();
          break;
        case 2:
          message.value = {
            $case: 'dcDaConnectionReturn',
            dcDaConnectionReturn: DcDaConnectionReturn.decode(reader, reader.uint32()),
          };
          break;
        case 3:
          message.value = {
            $case: 'dcDaQueryProfileReturn',
            dcDaQueryProfileReturn: DcDaQueryProfileReturn.decode(reader, reader.uint32()),
          };
          break;
        case 4:
          message.value = {
            $case: 'dcDaApplyStreamingOptionReturn',
            dcDaApplyStreamingOptionReturn: DcDaApplyStreamingOptionReturn.decode(reader, reader.uint32()),
          };
          break;
        case 5:
          message.value = {
            $case: 'dcDaControlReturn',
            dcDaControlReturn: DcDaControlReturn.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcDaReturn {
    return {
      seq: isSet(object.seq) ? Number(object.seq) : 0,
      value: isSet(object.dcDaConnectionReturn)
        ? {
            $case: 'dcDaConnectionReturn',
            dcDaConnectionReturn: DcDaConnectionReturn.fromJSON(object.dcDaConnectionReturn),
          }
        : isSet(object.dcDaQueryProfileReturn)
        ? {
            $case: 'dcDaQueryProfileReturn',
            dcDaQueryProfileReturn: DcDaQueryProfileReturn.fromJSON(object.dcDaQueryProfileReturn),
          }
        : isSet(object.dcDaApplyStreamingOptionReturn)
        ? {
            $case: 'dcDaApplyStreamingOptionReturn',
            dcDaApplyStreamingOptionReturn: DcDaApplyStreamingOptionReturn.fromJSON(object.dcDaApplyStreamingOptionReturn),
          }
        : isSet(object.dcDaControlReturn)
        ? { $case: 'dcDaControlReturn', dcDaControlReturn: DcDaControlReturn.fromJSON(object.dcDaControlReturn) }
        : undefined,
    };
  },

  toJSON(message: DcDaReturn): unknown {
    const obj: any = {};
    message.seq !== undefined && (obj.seq = Math.round(message.seq));
    message.value?.$case === 'dcDaConnectionReturn' &&
      (obj.dcDaConnectionReturn = message.value?.dcDaConnectionReturn ? DcDaConnectionReturn.toJSON(message.value?.dcDaConnectionReturn) : undefined);
    message.value?.$case === 'dcDaQueryProfileReturn' &&
      (obj.dcDaQueryProfileReturn = message.value?.dcDaQueryProfileReturn ? DcDaQueryProfileReturn.toJSON(message.value?.dcDaQueryProfileReturn) : undefined);
    message.value?.$case === 'dcDaApplyStreamingOptionReturn' &&
      (obj.dcDaApplyStreamingOptionReturn = message.value?.dcDaApplyStreamingOptionReturn
        ? DcDaApplyStreamingOptionReturn.toJSON(message.value?.dcDaApplyStreamingOptionReturn)
        : undefined);
    message.value?.$case === 'dcDaControlReturn' &&
      (obj.dcDaControlReturn = message.value?.dcDaControlReturn ? DcDaControlReturn.toJSON(message.value?.dcDaControlReturn) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcDaReturn>, I>>(object: I): DcDaReturn {
    const message = createBaseDcDaReturn();
    message.seq = object.seq ?? 0;
    if (object.value?.$case === 'dcDaConnectionReturn' && object.value?.dcDaConnectionReturn !== undefined && object.value?.dcDaConnectionReturn !== null) {
      message.value = {
        $case: 'dcDaConnectionReturn',
        dcDaConnectionReturn: DcDaConnectionReturn.fromPartial(object.value.dcDaConnectionReturn),
      };
    }
    if (object.value?.$case === 'dcDaQueryProfileReturn' && object.value?.dcDaQueryProfileReturn !== undefined && object.value?.dcDaQueryProfileReturn !== null) {
      message.value = {
        $case: 'dcDaQueryProfileReturn',
        dcDaQueryProfileReturn: DcDaQueryProfileReturn.fromPartial(object.value.dcDaQueryProfileReturn),
      };
    }
    if (
      object.value?.$case === 'dcDaApplyStreamingOptionReturn' &&
      object.value?.dcDaApplyStreamingOptionReturn !== undefined &&
      object.value?.dcDaApplyStreamingOptionReturn !== null
    ) {
      message.value = {
        $case: 'dcDaApplyStreamingOptionReturn',
        dcDaApplyStreamingOptionReturn: DcDaApplyStreamingOptionReturn.fromPartial(object.value.dcDaApplyStreamingOptionReturn),
      };
    }
    if (object.value?.$case === 'dcDaControlReturn' && object.value?.dcDaControlReturn !== undefined && object.value?.dcDaControlReturn !== null) {
      message.value = {
        $case: 'dcDaControlReturn',
        dcDaControlReturn: DcDaControlReturn.fromPartial(object.value.dcDaControlReturn),
      };
    }
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
