/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import {
  DcIdcCheckGrpcHealthParam,
  DcIdcCheckGrpcHealthResult,
  DcIdcOpenGrpcClientParam,
  DcIdcOpenGrpcClientResult,
  DcIdcScanIdsParam,
  DcIdcScanIdsResult,
  DcIdcStartScreenRecordParam,
  DcIdcStartScreenRecordResult,
  DcIdcStopScreenRecordParam,
  DcIdcStopScreenRecordResult,
} from '../types/dc_idc';

export interface DcIdcParam {
  value?:
    | { $case: 'dcIdcScanIdsParam'; dcIdcScanIdsParam: DcIdcScanIdsParam }
    | { $case: 'dcIdcOpenGrpcClientParam'; dcIdcOpenGrpcClientParam: DcIdcOpenGrpcClientParam }
    | { $case: 'dcIdcCheckGrpcHealthParam'; dcIdcCheckGrpcHealthParam: DcIdcCheckGrpcHealthParam }
    | { $case: 'dcIdcStartScreenRecordParam'; dcIdcStartScreenRecordParam: DcIdcStartScreenRecordParam }
    | { $case: 'dcIdcStopScreenRecordParam'; dcIdcStopScreenRecordParam: DcIdcStopScreenRecordParam };
}

export interface DcIdcResult {
  value?:
    | { $case: 'dcIdcScanIdsResult'; dcIdcScanIdsResult: DcIdcScanIdsResult }
    | { $case: 'dcIdcOpenGrpcClientResult'; dcIdcOpenGrpcClientResult: DcIdcOpenGrpcClientResult }
    | { $case: 'dcIdcCheckGrpcHealthResult'; dcIdcCheckGrpcHealthResult: DcIdcCheckGrpcHealthResult }
    | { $case: 'dcIdcStartScreenRecordResult'; dcIdcStartScreenRecordResult: DcIdcStartScreenRecordResult }
    | { $case: 'dcIdcStopScreenRecordResult'; dcIdcStopScreenRecordResult: DcIdcStopScreenRecordResult };
}

function createBaseDcIdcParam(): DcIdcParam {
  return { value: undefined };
}

export const DcIdcParam = {
  encode(message: DcIdcParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'dcIdcScanIdsParam') {
      DcIdcScanIdsParam.encode(message.value.dcIdcScanIdsParam, writer.uint32(10).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdcOpenGrpcClientParam') {
      DcIdcOpenGrpcClientParam.encode(message.value.dcIdcOpenGrpcClientParam, writer.uint32(26).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdcCheckGrpcHealthParam') {
      DcIdcCheckGrpcHealthParam.encode(message.value.dcIdcCheckGrpcHealthParam, writer.uint32(34).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdcStartScreenRecordParam') {
      DcIdcStartScreenRecordParam.encode(message.value.dcIdcStartScreenRecordParam, writer.uint32(42).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdcStopScreenRecordParam') {
      DcIdcStopScreenRecordParam.encode(message.value.dcIdcStopScreenRecordParam, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = {
            $case: 'dcIdcScanIdsParam',
            dcIdcScanIdsParam: DcIdcScanIdsParam.decode(reader, reader.uint32()),
          };
          break;
        case 3:
          message.value = {
            $case: 'dcIdcOpenGrpcClientParam',
            dcIdcOpenGrpcClientParam: DcIdcOpenGrpcClientParam.decode(reader, reader.uint32()),
          };
          break;
        case 4:
          message.value = {
            $case: 'dcIdcCheckGrpcHealthParam',
            dcIdcCheckGrpcHealthParam: DcIdcCheckGrpcHealthParam.decode(reader, reader.uint32()),
          };
          break;
        case 5:
          message.value = {
            $case: 'dcIdcStartScreenRecordParam',
            dcIdcStartScreenRecordParam: DcIdcStartScreenRecordParam.decode(reader, reader.uint32()),
          };
          break;
        case 6:
          message.value = {
            $case: 'dcIdcStopScreenRecordParam',
            dcIdcStopScreenRecordParam: DcIdcStopScreenRecordParam.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdcParam {
    return {
      value: isSet(object.dcIdcScanIdsParam)
        ? { $case: 'dcIdcScanIdsParam', dcIdcScanIdsParam: DcIdcScanIdsParam.fromJSON(object.dcIdcScanIdsParam) }
        : isSet(object.dcIdcOpenGrpcClientParam)
        ? {
            $case: 'dcIdcOpenGrpcClientParam',
            dcIdcOpenGrpcClientParam: DcIdcOpenGrpcClientParam.fromJSON(object.dcIdcOpenGrpcClientParam),
          }
        : isSet(object.dcIdcCheckGrpcHealthParam)
        ? {
            $case: 'dcIdcCheckGrpcHealthParam',
            dcIdcCheckGrpcHealthParam: DcIdcCheckGrpcHealthParam.fromJSON(object.dcIdcCheckGrpcHealthParam),
          }
        : isSet(object.dcIdcStartScreenRecordParam)
        ? {
            $case: 'dcIdcStartScreenRecordParam',
            dcIdcStartScreenRecordParam: DcIdcStartScreenRecordParam.fromJSON(object.dcIdcStartScreenRecordParam),
          }
        : isSet(object.dcIdcStopScreenRecordParam)
        ? {
            $case: 'dcIdcStopScreenRecordParam',
            dcIdcStopScreenRecordParam: DcIdcStopScreenRecordParam.fromJSON(object.dcIdcStopScreenRecordParam),
          }
        : undefined,
    };
  },

  toJSON(message: DcIdcParam): unknown {
    const obj: any = {};
    message.value?.$case === 'dcIdcScanIdsParam' &&
      (obj.dcIdcScanIdsParam = message.value?.dcIdcScanIdsParam ? DcIdcScanIdsParam.toJSON(message.value?.dcIdcScanIdsParam) : undefined);
    message.value?.$case === 'dcIdcOpenGrpcClientParam' &&
      (obj.dcIdcOpenGrpcClientParam = message.value?.dcIdcOpenGrpcClientParam ? DcIdcOpenGrpcClientParam.toJSON(message.value?.dcIdcOpenGrpcClientParam) : undefined);
    message.value?.$case === 'dcIdcCheckGrpcHealthParam' &&
      (obj.dcIdcCheckGrpcHealthParam = message.value?.dcIdcCheckGrpcHealthParam ? DcIdcCheckGrpcHealthParam.toJSON(message.value?.dcIdcCheckGrpcHealthParam) : undefined);
    message.value?.$case === 'dcIdcStartScreenRecordParam' &&
      (obj.dcIdcStartScreenRecordParam = message.value?.dcIdcStartScreenRecordParam ? DcIdcStartScreenRecordParam.toJSON(message.value?.dcIdcStartScreenRecordParam) : undefined);
    message.value?.$case === 'dcIdcStopScreenRecordParam' &&
      (obj.dcIdcStopScreenRecordParam = message.value?.dcIdcStopScreenRecordParam ? DcIdcStopScreenRecordParam.toJSON(message.value?.dcIdcStopScreenRecordParam) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcParam>, I>>(object: I): DcIdcParam {
    const message = createBaseDcIdcParam();
    if (object.value?.$case === 'dcIdcScanIdsParam' && object.value?.dcIdcScanIdsParam !== undefined && object.value?.dcIdcScanIdsParam !== null) {
      message.value = {
        $case: 'dcIdcScanIdsParam',
        dcIdcScanIdsParam: DcIdcScanIdsParam.fromPartial(object.value.dcIdcScanIdsParam),
      };
    }
    if (object.value?.$case === 'dcIdcOpenGrpcClientParam' && object.value?.dcIdcOpenGrpcClientParam !== undefined && object.value?.dcIdcOpenGrpcClientParam !== null) {
      message.value = {
        $case: 'dcIdcOpenGrpcClientParam',
        dcIdcOpenGrpcClientParam: DcIdcOpenGrpcClientParam.fromPartial(object.value.dcIdcOpenGrpcClientParam),
      };
    }
    if (object.value?.$case === 'dcIdcCheckGrpcHealthParam' && object.value?.dcIdcCheckGrpcHealthParam !== undefined && object.value?.dcIdcCheckGrpcHealthParam !== null) {
      message.value = {
        $case: 'dcIdcCheckGrpcHealthParam',
        dcIdcCheckGrpcHealthParam: DcIdcCheckGrpcHealthParam.fromPartial(object.value.dcIdcCheckGrpcHealthParam),
      };
    }
    if (object.value?.$case === 'dcIdcStartScreenRecordParam' && object.value?.dcIdcStartScreenRecordParam !== undefined && object.value?.dcIdcStartScreenRecordParam !== null) {
      message.value = {
        $case: 'dcIdcStartScreenRecordParam',
        dcIdcStartScreenRecordParam: DcIdcStartScreenRecordParam.fromPartial(object.value.dcIdcStartScreenRecordParam),
      };
    }
    if (object.value?.$case === 'dcIdcStopScreenRecordParam' && object.value?.dcIdcStopScreenRecordParam !== undefined && object.value?.dcIdcStopScreenRecordParam !== null) {
      message.value = {
        $case: 'dcIdcStopScreenRecordParam',
        dcIdcStopScreenRecordParam: DcIdcStopScreenRecordParam.fromPartial(object.value.dcIdcStopScreenRecordParam),
      };
    }
    return message;
  },
};

function createBaseDcIdcResult(): DcIdcResult {
  return { value: undefined };
}

export const DcIdcResult = {
  encode(message: DcIdcResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'dcIdcScanIdsResult') {
      DcIdcScanIdsResult.encode(message.value.dcIdcScanIdsResult, writer.uint32(10).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdcOpenGrpcClientResult') {
      DcIdcOpenGrpcClientResult.encode(message.value.dcIdcOpenGrpcClientResult, writer.uint32(26).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdcCheckGrpcHealthResult') {
      DcIdcCheckGrpcHealthResult.encode(message.value.dcIdcCheckGrpcHealthResult, writer.uint32(34).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdcStartScreenRecordResult') {
      DcIdcStartScreenRecordResult.encode(message.value.dcIdcStartScreenRecordResult, writer.uint32(42).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdcStopScreenRecordResult') {
      DcIdcStopScreenRecordResult.encode(message.value.dcIdcStopScreenRecordResult, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdcResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = {
            $case: 'dcIdcScanIdsResult',
            dcIdcScanIdsResult: DcIdcScanIdsResult.decode(reader, reader.uint32()),
          };
          break;
        case 3:
          message.value = {
            $case: 'dcIdcOpenGrpcClientResult',
            dcIdcOpenGrpcClientResult: DcIdcOpenGrpcClientResult.decode(reader, reader.uint32()),
          };
          break;
        case 4:
          message.value = {
            $case: 'dcIdcCheckGrpcHealthResult',
            dcIdcCheckGrpcHealthResult: DcIdcCheckGrpcHealthResult.decode(reader, reader.uint32()),
          };
          break;
        case 5:
          message.value = {
            $case: 'dcIdcStartScreenRecordResult',
            dcIdcStartScreenRecordResult: DcIdcStartScreenRecordResult.decode(reader, reader.uint32()),
          };
          break;
        case 6:
          message.value = {
            $case: 'dcIdcStopScreenRecordResult',
            dcIdcStopScreenRecordResult: DcIdcStopScreenRecordResult.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdcResult {
    return {
      value: isSet(object.dcIdcScanIdsResult)
        ? { $case: 'dcIdcScanIdsResult', dcIdcScanIdsResult: DcIdcScanIdsResult.fromJSON(object.dcIdcScanIdsResult) }
        : isSet(object.dcIdcOpenGrpcClientResult)
        ? {
            $case: 'dcIdcOpenGrpcClientResult',
            dcIdcOpenGrpcClientResult: DcIdcOpenGrpcClientResult.fromJSON(object.dcIdcOpenGrpcClientResult),
          }
        : isSet(object.dcIdcCheckGrpcHealthResult)
        ? {
            $case: 'dcIdcCheckGrpcHealthResult',
            dcIdcCheckGrpcHealthResult: DcIdcCheckGrpcHealthResult.fromJSON(object.dcIdcCheckGrpcHealthResult),
          }
        : isSet(object.dcIdcStartScreenRecordResult)
        ? {
            $case: 'dcIdcStartScreenRecordResult',
            dcIdcStartScreenRecordResult: DcIdcStartScreenRecordResult.fromJSON(object.dcIdcStartScreenRecordResult),
          }
        : isSet(object.dcIdcStopScreenRecordResult)
        ? {
            $case: 'dcIdcStopScreenRecordResult',
            dcIdcStopScreenRecordResult: DcIdcStopScreenRecordResult.fromJSON(object.dcIdcStopScreenRecordResult),
          }
        : undefined,
    };
  },

  toJSON(message: DcIdcResult): unknown {
    const obj: any = {};
    message.value?.$case === 'dcIdcScanIdsResult' &&
      (obj.dcIdcScanIdsResult = message.value?.dcIdcScanIdsResult ? DcIdcScanIdsResult.toJSON(message.value?.dcIdcScanIdsResult) : undefined);
    message.value?.$case === 'dcIdcOpenGrpcClientResult' &&
      (obj.dcIdcOpenGrpcClientResult = message.value?.dcIdcOpenGrpcClientResult ? DcIdcOpenGrpcClientResult.toJSON(message.value?.dcIdcOpenGrpcClientResult) : undefined);
    message.value?.$case === 'dcIdcCheckGrpcHealthResult' &&
      (obj.dcIdcCheckGrpcHealthResult = message.value?.dcIdcCheckGrpcHealthResult ? DcIdcCheckGrpcHealthResult.toJSON(message.value?.dcIdcCheckGrpcHealthResult) : undefined);
    message.value?.$case === 'dcIdcStartScreenRecordResult' &&
      (obj.dcIdcStartScreenRecordResult = message.value?.dcIdcStartScreenRecordResult
        ? DcIdcStartScreenRecordResult.toJSON(message.value?.dcIdcStartScreenRecordResult)
        : undefined);
    message.value?.$case === 'dcIdcStopScreenRecordResult' &&
      (obj.dcIdcStopScreenRecordResult = message.value?.dcIdcStopScreenRecordResult ? DcIdcStopScreenRecordResult.toJSON(message.value?.dcIdcStopScreenRecordResult) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdcResult>, I>>(object: I): DcIdcResult {
    const message = createBaseDcIdcResult();
    if (object.value?.$case === 'dcIdcScanIdsResult' && object.value?.dcIdcScanIdsResult !== undefined && object.value?.dcIdcScanIdsResult !== null) {
      message.value = {
        $case: 'dcIdcScanIdsResult',
        dcIdcScanIdsResult: DcIdcScanIdsResult.fromPartial(object.value.dcIdcScanIdsResult),
      };
    }
    if (object.value?.$case === 'dcIdcOpenGrpcClientResult' && object.value?.dcIdcOpenGrpcClientResult !== undefined && object.value?.dcIdcOpenGrpcClientResult !== null) {
      message.value = {
        $case: 'dcIdcOpenGrpcClientResult',
        dcIdcOpenGrpcClientResult: DcIdcOpenGrpcClientResult.fromPartial(object.value.dcIdcOpenGrpcClientResult),
      };
    }
    if (object.value?.$case === 'dcIdcCheckGrpcHealthResult' && object.value?.dcIdcCheckGrpcHealthResult !== undefined && object.value?.dcIdcCheckGrpcHealthResult !== null) {
      message.value = {
        $case: 'dcIdcCheckGrpcHealthResult',
        dcIdcCheckGrpcHealthResult: DcIdcCheckGrpcHealthResult.fromPartial(object.value.dcIdcCheckGrpcHealthResult),
      };
    }
    if (object.value?.$case === 'dcIdcStartScreenRecordResult' && object.value?.dcIdcStartScreenRecordResult !== undefined && object.value?.dcIdcStartScreenRecordResult !== null) {
      message.value = {
        $case: 'dcIdcStartScreenRecordResult',
        dcIdcStartScreenRecordResult: DcIdcStartScreenRecordResult.fromPartial(object.value.dcIdcStartScreenRecordResult),
      };
    }
    if (object.value?.$case === 'dcIdcStopScreenRecordResult' && object.value?.dcIdcStopScreenRecordResult !== undefined && object.value?.dcIdcStopScreenRecordResult !== null) {
      message.value = {
        $case: 'dcIdcStopScreenRecordResult',
        dcIdcStopScreenRecordResult: DcIdcStopScreenRecordResult.fromPartial(object.value.dcIdcStopScreenRecordResult),
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
