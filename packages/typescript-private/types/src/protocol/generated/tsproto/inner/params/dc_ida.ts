/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import {
  DcIdaGetSystemInfoParam,
  DcIdaGetSystemInfoResult,
  DcIdaIsPortListeningParam,
  DcIdaIsPortListeningResult,
  DcIdaQueryProfileParam,
  DcIdaQueryProfileResult,
  DcIdaRunAppParam,
  DcIdaRunAppResult,
} from '../types/dc_ida';
import { CfGdcDaParamList, CfGdcDaResultList } from './cf_gdc_da';

export interface DcIdaParam {
  value?:
    | { $case: 'dcIdaRunappParam'; dcIdaRunappParam: DcIdaRunAppParam }
    | { $case: 'dcIdaGetSystemInfoParam'; dcIdaGetSystemInfoParam: DcIdaGetSystemInfoParam }
    | { $case: 'dcIdaIsPortListeningParam'; dcIdaIsPortListeningParam: DcIdaIsPortListeningParam }
    | { $case: 'dcIdaQueryProfileParam'; dcIdaQueryProfileParam: DcIdaQueryProfileParam }
    | { $case: 'dcGdcDaParam'; dcGdcDaParam: CfGdcDaParamList };
}

export interface DcIdaResult {
  value?:
    | { $case: 'dcIdaRunappResult'; dcIdaRunappResult: DcIdaRunAppResult }
    | { $case: 'dcIdaGetSystemInfoResult'; dcIdaGetSystemInfoResult: DcIdaGetSystemInfoResult }
    | { $case: 'dcIdaIsPortListeningResult'; dcIdaIsPortListeningResult: DcIdaIsPortListeningResult }
    | { $case: 'dcIdaQueryProfileResult'; dcIdaQueryProfileResult: DcIdaQueryProfileResult }
    | { $case: 'dcGdcDaResult'; dcGdcDaResult: CfGdcDaResultList };
}

function createBaseDcIdaParam(): DcIdaParam {
  return { value: undefined };
}

export const DcIdaParam = {
  encode(message: DcIdaParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'dcIdaRunappParam') {
      DcIdaRunAppParam.encode(message.value.dcIdaRunappParam, writer.uint32(10).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdaGetSystemInfoParam') {
      DcIdaGetSystemInfoParam.encode(message.value.dcIdaGetSystemInfoParam, writer.uint32(18).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdaIsPortListeningParam') {
      DcIdaIsPortListeningParam.encode(message.value.dcIdaIsPortListeningParam, writer.uint32(26).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdaQueryProfileParam') {
      DcIdaQueryProfileParam.encode(message.value.dcIdaQueryProfileParam, writer.uint32(34).fork()).ldelim();
    }
    if (message.value?.$case === 'dcGdcDaParam') {
      CfGdcDaParamList.encode(message.value.dcGdcDaParam, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdaParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = {
            $case: 'dcIdaRunappParam',
            dcIdaRunappParam: DcIdaRunAppParam.decode(reader, reader.uint32()),
          };
          break;
        case 2:
          message.value = {
            $case: 'dcIdaGetSystemInfoParam',
            dcIdaGetSystemInfoParam: DcIdaGetSystemInfoParam.decode(reader, reader.uint32()),
          };
          break;
        case 3:
          message.value = {
            $case: 'dcIdaIsPortListeningParam',
            dcIdaIsPortListeningParam: DcIdaIsPortListeningParam.decode(reader, reader.uint32()),
          };
          break;
        case 4:
          message.value = {
            $case: 'dcIdaQueryProfileParam',
            dcIdaQueryProfileParam: DcIdaQueryProfileParam.decode(reader, reader.uint32()),
          };
          break;
        case 5:
          message.value = { $case: 'dcGdcDaParam', dcGdcDaParam: CfGdcDaParamList.decode(reader, reader.uint32()) };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdaParam {
    return {
      value: isSet(object.dcIdaRunappParam)
        ? { $case: 'dcIdaRunappParam', dcIdaRunappParam: DcIdaRunAppParam.fromJSON(object.dcIdaRunappParam) }
        : isSet(object.dcIdaGetSystemInfoParam)
        ? {
            $case: 'dcIdaGetSystemInfoParam',
            dcIdaGetSystemInfoParam: DcIdaGetSystemInfoParam.fromJSON(object.dcIdaGetSystemInfoParam),
          }
        : isSet(object.dcIdaIsPortListeningParam)
        ? {
            $case: 'dcIdaIsPortListeningParam',
            dcIdaIsPortListeningParam: DcIdaIsPortListeningParam.fromJSON(object.dcIdaIsPortListeningParam),
          }
        : isSet(object.dcIdaQueryProfileParam)
        ? {
            $case: 'dcIdaQueryProfileParam',
            dcIdaQueryProfileParam: DcIdaQueryProfileParam.fromJSON(object.dcIdaQueryProfileParam),
          }
        : isSet(object.dcGdcDaParam)
        ? { $case: 'dcGdcDaParam', dcGdcDaParam: CfGdcDaParamList.fromJSON(object.dcGdcDaParam) }
        : undefined,
    };
  },

  toJSON(message: DcIdaParam): unknown {
    const obj: any = {};
    message.value?.$case === 'dcIdaRunappParam' && (obj.dcIdaRunappParam = message.value?.dcIdaRunappParam ? DcIdaRunAppParam.toJSON(message.value?.dcIdaRunappParam) : undefined);
    message.value?.$case === 'dcIdaGetSystemInfoParam' &&
      (obj.dcIdaGetSystemInfoParam = message.value?.dcIdaGetSystemInfoParam ? DcIdaGetSystemInfoParam.toJSON(message.value?.dcIdaGetSystemInfoParam) : undefined);
    message.value?.$case === 'dcIdaIsPortListeningParam' &&
      (obj.dcIdaIsPortListeningParam = message.value?.dcIdaIsPortListeningParam ? DcIdaIsPortListeningParam.toJSON(message.value?.dcIdaIsPortListeningParam) : undefined);
    message.value?.$case === 'dcIdaQueryProfileParam' &&
      (obj.dcIdaQueryProfileParam = message.value?.dcIdaQueryProfileParam ? DcIdaQueryProfileParam.toJSON(message.value?.dcIdaQueryProfileParam) : undefined);
    message.value?.$case === 'dcGdcDaParam' && (obj.dcGdcDaParam = message.value?.dcGdcDaParam ? CfGdcDaParamList.toJSON(message.value?.dcGdcDaParam) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdaParam>, I>>(object: I): DcIdaParam {
    const message = createBaseDcIdaParam();
    if (object.value?.$case === 'dcIdaRunappParam' && object.value?.dcIdaRunappParam !== undefined && object.value?.dcIdaRunappParam !== null) {
      message.value = {
        $case: 'dcIdaRunappParam',
        dcIdaRunappParam: DcIdaRunAppParam.fromPartial(object.value.dcIdaRunappParam),
      };
    }
    if (object.value?.$case === 'dcIdaGetSystemInfoParam' && object.value?.dcIdaGetSystemInfoParam !== undefined && object.value?.dcIdaGetSystemInfoParam !== null) {
      message.value = {
        $case: 'dcIdaGetSystemInfoParam',
        dcIdaGetSystemInfoParam: DcIdaGetSystemInfoParam.fromPartial(object.value.dcIdaGetSystemInfoParam),
      };
    }
    if (object.value?.$case === 'dcIdaIsPortListeningParam' && object.value?.dcIdaIsPortListeningParam !== undefined && object.value?.dcIdaIsPortListeningParam !== null) {
      message.value = {
        $case: 'dcIdaIsPortListeningParam',
        dcIdaIsPortListeningParam: DcIdaIsPortListeningParam.fromPartial(object.value.dcIdaIsPortListeningParam),
      };
    }
    if (object.value?.$case === 'dcIdaQueryProfileParam' && object.value?.dcIdaQueryProfileParam !== undefined && object.value?.dcIdaQueryProfileParam !== null) {
      message.value = {
        $case: 'dcIdaQueryProfileParam',
        dcIdaQueryProfileParam: DcIdaQueryProfileParam.fromPartial(object.value.dcIdaQueryProfileParam),
      };
    }
    if (object.value?.$case === 'dcGdcDaParam' && object.value?.dcGdcDaParam !== undefined && object.value?.dcGdcDaParam !== null) {
      message.value = { $case: 'dcGdcDaParam', dcGdcDaParam: CfGdcDaParamList.fromPartial(object.value.dcGdcDaParam) };
    }
    return message;
  },
};

function createBaseDcIdaResult(): DcIdaResult {
  return { value: undefined };
}

export const DcIdaResult = {
  encode(message: DcIdaResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'dcIdaRunappResult') {
      DcIdaRunAppResult.encode(message.value.dcIdaRunappResult, writer.uint32(10).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdaGetSystemInfoResult') {
      DcIdaGetSystemInfoResult.encode(message.value.dcIdaGetSystemInfoResult, writer.uint32(18).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdaIsPortListeningResult') {
      DcIdaIsPortListeningResult.encode(message.value.dcIdaIsPortListeningResult, writer.uint32(26).fork()).ldelim();
    }
    if (message.value?.$case === 'dcIdaQueryProfileResult') {
      DcIdaQueryProfileResult.encode(message.value.dcIdaQueryProfileResult, writer.uint32(34).fork()).ldelim();
    }
    if (message.value?.$case === 'dcGdcDaResult') {
      CfGdcDaResultList.encode(message.value.dcGdcDaResult, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDcIdaResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = {
            $case: 'dcIdaRunappResult',
            dcIdaRunappResult: DcIdaRunAppResult.decode(reader, reader.uint32()),
          };
          break;
        case 2:
          message.value = {
            $case: 'dcIdaGetSystemInfoResult',
            dcIdaGetSystemInfoResult: DcIdaGetSystemInfoResult.decode(reader, reader.uint32()),
          };
          break;
        case 3:
          message.value = {
            $case: 'dcIdaIsPortListeningResult',
            dcIdaIsPortListeningResult: DcIdaIsPortListeningResult.decode(reader, reader.uint32()),
          };
          break;
        case 4:
          message.value = {
            $case: 'dcIdaQueryProfileResult',
            dcIdaQueryProfileResult: DcIdaQueryProfileResult.decode(reader, reader.uint32()),
          };
          break;
        case 5:
          message.value = { $case: 'dcGdcDaResult', dcGdcDaResult: CfGdcDaResultList.decode(reader, reader.uint32()) };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DcIdaResult {
    return {
      value: isSet(object.dcIdaRunappResult)
        ? { $case: 'dcIdaRunappResult', dcIdaRunappResult: DcIdaRunAppResult.fromJSON(object.dcIdaRunappResult) }
        : isSet(object.dcIdaGetSystemInfoResult)
        ? {
            $case: 'dcIdaGetSystemInfoResult',
            dcIdaGetSystemInfoResult: DcIdaGetSystemInfoResult.fromJSON(object.dcIdaGetSystemInfoResult),
          }
        : isSet(object.dcIdaIsPortListeningResult)
        ? {
            $case: 'dcIdaIsPortListeningResult',
            dcIdaIsPortListeningResult: DcIdaIsPortListeningResult.fromJSON(object.dcIdaIsPortListeningResult),
          }
        : isSet(object.dcIdaQueryProfileResult)
        ? {
            $case: 'dcIdaQueryProfileResult',
            dcIdaQueryProfileResult: DcIdaQueryProfileResult.fromJSON(object.dcIdaQueryProfileResult),
          }
        : isSet(object.dcGdcDaResult)
        ? { $case: 'dcGdcDaResult', dcGdcDaResult: CfGdcDaResultList.fromJSON(object.dcGdcDaResult) }
        : undefined,
    };
  },

  toJSON(message: DcIdaResult): unknown {
    const obj: any = {};
    message.value?.$case === 'dcIdaRunappResult' &&
      (obj.dcIdaRunappResult = message.value?.dcIdaRunappResult ? DcIdaRunAppResult.toJSON(message.value?.dcIdaRunappResult) : undefined);
    message.value?.$case === 'dcIdaGetSystemInfoResult' &&
      (obj.dcIdaGetSystemInfoResult = message.value?.dcIdaGetSystemInfoResult ? DcIdaGetSystemInfoResult.toJSON(message.value?.dcIdaGetSystemInfoResult) : undefined);
    message.value?.$case === 'dcIdaIsPortListeningResult' &&
      (obj.dcIdaIsPortListeningResult = message.value?.dcIdaIsPortListeningResult ? DcIdaIsPortListeningResult.toJSON(message.value?.dcIdaIsPortListeningResult) : undefined);
    message.value?.$case === 'dcIdaQueryProfileResult' &&
      (obj.dcIdaQueryProfileResult = message.value?.dcIdaQueryProfileResult ? DcIdaQueryProfileResult.toJSON(message.value?.dcIdaQueryProfileResult) : undefined);
    message.value?.$case === 'dcGdcDaResult' && (obj.dcGdcDaResult = message.value?.dcGdcDaResult ? CfGdcDaResultList.toJSON(message.value?.dcGdcDaResult) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DcIdaResult>, I>>(object: I): DcIdaResult {
    const message = createBaseDcIdaResult();
    if (object.value?.$case === 'dcIdaRunappResult' && object.value?.dcIdaRunappResult !== undefined && object.value?.dcIdaRunappResult !== null) {
      message.value = {
        $case: 'dcIdaRunappResult',
        dcIdaRunappResult: DcIdaRunAppResult.fromPartial(object.value.dcIdaRunappResult),
      };
    }
    if (object.value?.$case === 'dcIdaGetSystemInfoResult' && object.value?.dcIdaGetSystemInfoResult !== undefined && object.value?.dcIdaGetSystemInfoResult !== null) {
      message.value = {
        $case: 'dcIdaGetSystemInfoResult',
        dcIdaGetSystemInfoResult: DcIdaGetSystemInfoResult.fromPartial(object.value.dcIdaGetSystemInfoResult),
      };
    }
    if (object.value?.$case === 'dcIdaIsPortListeningResult' && object.value?.dcIdaIsPortListeningResult !== undefined && object.value?.dcIdaIsPortListeningResult !== null) {
      message.value = {
        $case: 'dcIdaIsPortListeningResult',
        dcIdaIsPortListeningResult: DcIdaIsPortListeningResult.fromPartial(object.value.dcIdaIsPortListeningResult),
      };
    }
    if (object.value?.$case === 'dcIdaQueryProfileResult' && object.value?.dcIdaQueryProfileResult !== undefined && object.value?.dcIdaQueryProfileResult !== null) {
      message.value = {
        $case: 'dcIdaQueryProfileResult',
        dcIdaQueryProfileResult: DcIdaQueryProfileResult.fromPartial(object.value.dcIdaQueryProfileResult),
      };
    }
    if (object.value?.$case === 'dcGdcDaResult' && object.value?.dcGdcDaResult !== undefined && object.value?.dcGdcDaResult !== null) {
      message.value = {
        $case: 'dcGdcDaResult',
        dcGdcDaResult: CfGdcDaResultList.fromPartial(object.value.dcGdcDaResult),
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
