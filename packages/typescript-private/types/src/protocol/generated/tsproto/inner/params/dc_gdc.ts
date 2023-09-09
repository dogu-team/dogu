/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import {
  DcGdcGetSurfaceStatusParam,
  DcGdcGetSurfaceStatusResult,
  DcGdcStartScreenRecordParam,
  DcGdcStartScreenRecordResult,
  DcGdcStopScreenRecordParam,
  DcGdcStopScreenRecordResult,
  DcGdcUpdateDeviceListParam,
  DcGdcUpdateDeviceListResult,
} from '../types/dc_gdc';

export interface DcGdcParam {
  value?:
    | { $case: 'dcGdcUpdateDevicelistParam'; dcGdcUpdateDevicelistParam: DcGdcUpdateDeviceListParam }
    | { $case: 'dcGdcStartScreenRecordParam'; dcGdcStartScreenRecordParam: DcGdcStartScreenRecordParam }
    | { $case: 'dcGdcStopScreenRecordParam'; dcGdcStopScreenRecordParam: DcGdcStopScreenRecordParam }
    | { $case: 'dcGdcGetSurfaceStatusParam'; dcGdcGetSurfaceStatusParam: DcGdcGetSurfaceStatusParam };
}

export interface DcGdcResult {
  value?:
    | { $case: 'dcGdcUpdateDevicelistResult'; dcGdcUpdateDevicelistResult: DcGdcUpdateDeviceListResult }
    | { $case: 'dcGdcStartScreenRecordResult'; dcGdcStartScreenRecordResult: DcGdcStartScreenRecordResult }
    | { $case: 'dcGdcStopScreenRecordResult'; dcGdcStopScreenRecordResult: DcGdcStopScreenRecordResult }
    | { $case: 'dcGdcGetSurfaceStatusResult'; dcGdcGetSurfaceStatusResult: DcGdcGetSurfaceStatusResult };
}

function createBaseDcGdcParam(): DcGdcParam {
  return { value: undefined };
}

export const DcGdcParam = {
  encode(message: DcGdcParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'dcGdcUpdateDevicelistParam') {
      DcGdcUpdateDeviceListParam.encode(message.value.dcGdcUpdateDevicelistParam, writer.uint32(82).fork()).ldelim();
    }
    if (message.value?.$case === 'dcGdcStartScreenRecordParam') {
      DcGdcStartScreenRecordParam.encode(message.value.dcGdcStartScreenRecordParam, writer.uint32(106).fork()).ldelim();
    }
    if (message.value?.$case === 'dcGdcStopScreenRecordParam') {
      DcGdcStopScreenRecordParam.encode(message.value.dcGdcStopScreenRecordParam, writer.uint32(114).fork()).ldelim();
    }
    if (message.value?.$case === 'dcGdcGetSurfaceStatusParam') {
      DcGdcGetSurfaceStatusParam.encode(message.value.dcGdcGetSurfaceStatusParam, writer.uint32(122).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 10:
          message.value = {
            $case: 'dcGdcUpdateDevicelistParam',
            dcGdcUpdateDevicelistParam: DcGdcUpdateDeviceListParam.decode(reader, reader.uint32()),
          };
          break;
        case 13:
          message.value = {
            $case: 'dcGdcStartScreenRecordParam',
            dcGdcStartScreenRecordParam: DcGdcStartScreenRecordParam.decode(reader, reader.uint32()),
          };
          break;
        case 14:
          message.value = {
            $case: 'dcGdcStopScreenRecordParam',
            dcGdcStopScreenRecordParam: DcGdcStopScreenRecordParam.decode(reader, reader.uint32()),
          };
          break;
        case 15:
          message.value = {
            $case: 'dcGdcGetSurfaceStatusParam',
            dcGdcGetSurfaceStatusParam: DcGdcGetSurfaceStatusParam.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcGdcParam {
    return {
      value: isSet(object.dcGdcUpdateDevicelistParam)
        ? {
            $case: 'dcGdcUpdateDevicelistParam',
            dcGdcUpdateDevicelistParam: DcGdcUpdateDeviceListParam.fromJSON(object.dcGdcUpdateDevicelistParam),
          }
        : isSet(object.dcGdcStartScreenRecordParam)
        ? {
            $case: 'dcGdcStartScreenRecordParam',
            dcGdcStartScreenRecordParam: DcGdcStartScreenRecordParam.fromJSON(object.dcGdcStartScreenRecordParam),
          }
        : isSet(object.dcGdcStopScreenRecordParam)
        ? {
            $case: 'dcGdcStopScreenRecordParam',
            dcGdcStopScreenRecordParam: DcGdcStopScreenRecordParam.fromJSON(object.dcGdcStopScreenRecordParam),
          }
        : isSet(object.dcGdcGetSurfaceStatusParam)
        ? {
            $case: 'dcGdcGetSurfaceStatusParam',
            dcGdcGetSurfaceStatusParam: DcGdcGetSurfaceStatusParam.fromJSON(object.dcGdcGetSurfaceStatusParam),
          }
        : undefined,
    };
  },

  toJSON(message: DcGdcParam): unknown {
    const obj: any = {};
    message.value?.$case === 'dcGdcUpdateDevicelistParam' &&
      (obj.dcGdcUpdateDevicelistParam = message.value?.dcGdcUpdateDevicelistParam ? DcGdcUpdateDeviceListParam.toJSON(message.value?.dcGdcUpdateDevicelistParam) : undefined);
    message.value?.$case === 'dcGdcStartScreenRecordParam' &&
      (obj.dcGdcStartScreenRecordParam = message.value?.dcGdcStartScreenRecordParam ? DcGdcStartScreenRecordParam.toJSON(message.value?.dcGdcStartScreenRecordParam) : undefined);
    message.value?.$case === 'dcGdcStopScreenRecordParam' &&
      (obj.dcGdcStopScreenRecordParam = message.value?.dcGdcStopScreenRecordParam ? DcGdcStopScreenRecordParam.toJSON(message.value?.dcGdcStopScreenRecordParam) : undefined);
    message.value?.$case === 'dcGdcGetSurfaceStatusParam' &&
      (obj.dcGdcGetSurfaceStatusParam = message.value?.dcGdcGetSurfaceStatusParam ? DcGdcGetSurfaceStatusParam.toJSON(message.value?.dcGdcGetSurfaceStatusParam) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcParam>, I>>(object: I): DcGdcParam {
    const message = createBaseDcGdcParam();
    if (object.value?.$case === 'dcGdcUpdateDevicelistParam' && object.value?.dcGdcUpdateDevicelistParam !== undefined && object.value?.dcGdcUpdateDevicelistParam !== null) {
      message.value = {
        $case: 'dcGdcUpdateDevicelistParam',
        dcGdcUpdateDevicelistParam: DcGdcUpdateDeviceListParam.fromPartial(object.value.dcGdcUpdateDevicelistParam),
      };
    }
    if (object.value?.$case === 'dcGdcStartScreenRecordParam' && object.value?.dcGdcStartScreenRecordParam !== undefined && object.value?.dcGdcStartScreenRecordParam !== null) {
      message.value = {
        $case: 'dcGdcStartScreenRecordParam',
        dcGdcStartScreenRecordParam: DcGdcStartScreenRecordParam.fromPartial(object.value.dcGdcStartScreenRecordParam),
      };
    }
    if (object.value?.$case === 'dcGdcStopScreenRecordParam' && object.value?.dcGdcStopScreenRecordParam !== undefined && object.value?.dcGdcStopScreenRecordParam !== null) {
      message.value = {
        $case: 'dcGdcStopScreenRecordParam',
        dcGdcStopScreenRecordParam: DcGdcStopScreenRecordParam.fromPartial(object.value.dcGdcStopScreenRecordParam),
      };
    }
    if (object.value?.$case === 'dcGdcGetSurfaceStatusParam' && object.value?.dcGdcGetSurfaceStatusParam !== undefined && object.value?.dcGdcGetSurfaceStatusParam !== null) {
      message.value = {
        $case: 'dcGdcGetSurfaceStatusParam',
        dcGdcGetSurfaceStatusParam: DcGdcGetSurfaceStatusParam.fromPartial(object.value.dcGdcGetSurfaceStatusParam),
      };
    }
    return message;
  },
};

function createBaseDcGdcResult(): DcGdcResult {
  return { value: undefined };
}

export const DcGdcResult = {
  encode(message: DcGdcResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'dcGdcUpdateDevicelistResult') {
      DcGdcUpdateDeviceListResult.encode(message.value.dcGdcUpdateDevicelistResult, writer.uint32(82).fork()).ldelim();
    }
    if (message.value?.$case === 'dcGdcStartScreenRecordResult') {
      DcGdcStartScreenRecordResult.encode(message.value.dcGdcStartScreenRecordResult, writer.uint32(106).fork()).ldelim();
    }
    if (message.value?.$case === 'dcGdcStopScreenRecordResult') {
      DcGdcStopScreenRecordResult.encode(message.value.dcGdcStopScreenRecordResult, writer.uint32(114).fork()).ldelim();
    }
    if (message.value?.$case === 'dcGdcGetSurfaceStatusResult') {
      DcGdcGetSurfaceStatusResult.encode(message.value.dcGdcGetSurfaceStatusResult, writer.uint32(122).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcGdcResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 10:
          message.value = {
            $case: 'dcGdcUpdateDevicelistResult',
            dcGdcUpdateDevicelistResult: DcGdcUpdateDeviceListResult.decode(reader, reader.uint32()),
          };
          break;
        case 13:
          message.value = {
            $case: 'dcGdcStartScreenRecordResult',
            dcGdcStartScreenRecordResult: DcGdcStartScreenRecordResult.decode(reader, reader.uint32()),
          };
          break;
        case 14:
          message.value = {
            $case: 'dcGdcStopScreenRecordResult',
            dcGdcStopScreenRecordResult: DcGdcStopScreenRecordResult.decode(reader, reader.uint32()),
          };
          break;
        case 15:
          message.value = {
            $case: 'dcGdcGetSurfaceStatusResult',
            dcGdcGetSurfaceStatusResult: DcGdcGetSurfaceStatusResult.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcGdcResult {
    return {
      value: isSet(object.dcGdcUpdateDevicelistResult)
        ? {
            $case: 'dcGdcUpdateDevicelistResult',
            dcGdcUpdateDevicelistResult: DcGdcUpdateDeviceListResult.fromJSON(object.dcGdcUpdateDevicelistResult),
          }
        : isSet(object.dcGdcStartScreenRecordResult)
        ? {
            $case: 'dcGdcStartScreenRecordResult',
            dcGdcStartScreenRecordResult: DcGdcStartScreenRecordResult.fromJSON(object.dcGdcStartScreenRecordResult),
          }
        : isSet(object.dcGdcStopScreenRecordResult)
        ? {
            $case: 'dcGdcStopScreenRecordResult',
            dcGdcStopScreenRecordResult: DcGdcStopScreenRecordResult.fromJSON(object.dcGdcStopScreenRecordResult),
          }
        : isSet(object.dcGdcGetSurfaceStatusResult)
        ? {
            $case: 'dcGdcGetSurfaceStatusResult',
            dcGdcGetSurfaceStatusResult: DcGdcGetSurfaceStatusResult.fromJSON(object.dcGdcGetSurfaceStatusResult),
          }
        : undefined,
    };
  },

  toJSON(message: DcGdcResult): unknown {
    const obj: any = {};
    message.value?.$case === 'dcGdcUpdateDevicelistResult' &&
      (obj.dcGdcUpdateDevicelistResult = message.value?.dcGdcUpdateDevicelistResult ? DcGdcUpdateDeviceListResult.toJSON(message.value?.dcGdcUpdateDevicelistResult) : undefined);
    message.value?.$case === 'dcGdcStartScreenRecordResult' &&
      (obj.dcGdcStartScreenRecordResult = message.value?.dcGdcStartScreenRecordResult
        ? DcGdcStartScreenRecordResult.toJSON(message.value?.dcGdcStartScreenRecordResult)
        : undefined);
    message.value?.$case === 'dcGdcStopScreenRecordResult' &&
      (obj.dcGdcStopScreenRecordResult = message.value?.dcGdcStopScreenRecordResult ? DcGdcStopScreenRecordResult.toJSON(message.value?.dcGdcStopScreenRecordResult) : undefined);
    message.value?.$case === 'dcGdcGetSurfaceStatusResult' &&
      (obj.dcGdcGetSurfaceStatusResult = message.value?.dcGdcGetSurfaceStatusResult ? DcGdcGetSurfaceStatusResult.toJSON(message.value?.dcGdcGetSurfaceStatusResult) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcGdcResult>, I>>(object: I): DcGdcResult {
    const message = createBaseDcGdcResult();
    if (object.value?.$case === 'dcGdcUpdateDevicelistResult' && object.value?.dcGdcUpdateDevicelistResult !== undefined && object.value?.dcGdcUpdateDevicelistResult !== null) {
      message.value = {
        $case: 'dcGdcUpdateDevicelistResult',
        dcGdcUpdateDevicelistResult: DcGdcUpdateDeviceListResult.fromPartial(object.value.dcGdcUpdateDevicelistResult),
      };
    }
    if (object.value?.$case === 'dcGdcStartScreenRecordResult' && object.value?.dcGdcStartScreenRecordResult !== undefined && object.value?.dcGdcStartScreenRecordResult !== null) {
      message.value = {
        $case: 'dcGdcStartScreenRecordResult',
        dcGdcStartScreenRecordResult: DcGdcStartScreenRecordResult.fromPartial(object.value.dcGdcStartScreenRecordResult),
      };
    }
    if (object.value?.$case === 'dcGdcStopScreenRecordResult' && object.value?.dcGdcStopScreenRecordResult !== undefined && object.value?.dcGdcStopScreenRecordResult !== null) {
      message.value = {
        $case: 'dcGdcStopScreenRecordResult',
        dcGdcStopScreenRecordResult: DcGdcStopScreenRecordResult.fromPartial(object.value.dcGdcStopScreenRecordResult),
      };
    }
    if (object.value?.$case === 'dcGdcGetSurfaceStatusResult' && object.value?.dcGdcGetSurfaceStatusResult !== undefined && object.value?.dcGdcGetSurfaceStatusResult !== null) {
      message.value = {
        $case: 'dcGdcGetSurfaceStatusResult',
        dcGdcGetSurfaceStatusResult: DcGdcGetSurfaceStatusResult.fromPartial(object.value.dcGdcGetSurfaceStatusResult),
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
