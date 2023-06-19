/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { CfGdcDaControlParam, CfGdcDaControlResult } from '../types/cf_gdc_da';

export interface CfGdcDaParam {
  seq: number;
  serial: string;
  value?: { $case: 'cfGdcDaControlParam'; cfGdcDaControlParam: CfGdcDaControlParam };
}

export interface CfGdcDaResult {
  seq: number;
  value?: { $case: 'cfGdcDaControlResult'; cfGdcDaControlResult: CfGdcDaControlResult };
}

export interface CfGdcDaParamList {
  params: CfGdcDaParam[];
}

export interface CfGdcDaResultList {
  results: CfGdcDaResult[];
}

function createBaseCfGdcDaParam(): CfGdcDaParam {
  return { seq: 0, serial: '', value: undefined };
}

export const CfGdcDaParam = {
  encode(message: CfGdcDaParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.seq !== 0) {
      writer.uint32(13).fixed32(message.seq);
    }
    if (message.serial !== '') {
      writer.uint32(18).string(message.serial);
    }
    if (message.value?.$case === 'cfGdcDaControlParam') {
      CfGdcDaControlParam.encode(message.value.cfGdcDaControlParam, writer.uint32(82).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CfGdcDaParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCfGdcDaParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.seq = reader.fixed32();
          break;
        case 2:
          message.serial = reader.string();
          break;
        case 10:
          message.value = {
            $case: 'cfGdcDaControlParam',
            cfGdcDaControlParam: CfGdcDaControlParam.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CfGdcDaParam {
    return {
      seq: isSet(object.seq) ? Number(object.seq) : 0,
      serial: isSet(object.serial) ? String(object.serial) : '',
      value: isSet(object.cfGdcDaControlParam)
        ? {
            $case: 'cfGdcDaControlParam',
            cfGdcDaControlParam: CfGdcDaControlParam.fromJSON(object.cfGdcDaControlParam),
          }
        : undefined,
    };
  },

  toJSON(message: CfGdcDaParam): unknown {
    const obj: any = {};
    message.seq !== undefined && (obj.seq = Math.round(message.seq));
    message.serial !== undefined && (obj.serial = message.serial);
    message.value?.$case === 'cfGdcDaControlParam' &&
      (obj.cfGdcDaControlParam = message.value?.cfGdcDaControlParam ? CfGdcDaControlParam.toJSON(message.value?.cfGdcDaControlParam) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CfGdcDaParam>, I>>(object: I): CfGdcDaParam {
    const message = createBaseCfGdcDaParam();
    message.seq = object.seq ?? 0;
    message.serial = object.serial ?? '';
    if (object.value?.$case === 'cfGdcDaControlParam' && object.value?.cfGdcDaControlParam !== undefined && object.value?.cfGdcDaControlParam !== null) {
      message.value = {
        $case: 'cfGdcDaControlParam',
        cfGdcDaControlParam: CfGdcDaControlParam.fromPartial(object.value.cfGdcDaControlParam),
      };
    }
    return message;
  },
};

function createBaseCfGdcDaResult(): CfGdcDaResult {
  return { seq: 0, value: undefined };
}

export const CfGdcDaResult = {
  encode(message: CfGdcDaResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.seq !== 0) {
      writer.uint32(13).fixed32(message.seq);
    }
    if (message.value?.$case === 'cfGdcDaControlResult') {
      CfGdcDaControlResult.encode(message.value.cfGdcDaControlResult, writer.uint32(82).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CfGdcDaResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCfGdcDaResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.seq = reader.fixed32();
          break;
        case 10:
          message.value = {
            $case: 'cfGdcDaControlResult',
            cfGdcDaControlResult: CfGdcDaControlResult.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CfGdcDaResult {
    return {
      seq: isSet(object.seq) ? Number(object.seq) : 0,
      value: isSet(object.cfGdcDaControlResult)
        ? {
            $case: 'cfGdcDaControlResult',
            cfGdcDaControlResult: CfGdcDaControlResult.fromJSON(object.cfGdcDaControlResult),
          }
        : undefined,
    };
  },

  toJSON(message: CfGdcDaResult): unknown {
    const obj: any = {};
    message.seq !== undefined && (obj.seq = Math.round(message.seq));
    message.value?.$case === 'cfGdcDaControlResult' &&
      (obj.cfGdcDaControlResult = message.value?.cfGdcDaControlResult ? CfGdcDaControlResult.toJSON(message.value?.cfGdcDaControlResult) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CfGdcDaResult>, I>>(object: I): CfGdcDaResult {
    const message = createBaseCfGdcDaResult();
    message.seq = object.seq ?? 0;
    if (object.value?.$case === 'cfGdcDaControlResult' && object.value?.cfGdcDaControlResult !== undefined && object.value?.cfGdcDaControlResult !== null) {
      message.value = {
        $case: 'cfGdcDaControlResult',
        cfGdcDaControlResult: CfGdcDaControlResult.fromPartial(object.value.cfGdcDaControlResult),
      };
    }
    return message;
  },
};

function createBaseCfGdcDaParamList(): CfGdcDaParamList {
  return { params: [] };
}

export const CfGdcDaParamList = {
  encode(message: CfGdcDaParamList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.params) {
      CfGdcDaParam.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CfGdcDaParamList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCfGdcDaParamList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params.push(CfGdcDaParam.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CfGdcDaParamList {
    return { params: Array.isArray(object?.params) ? object.params.map((e: any) => CfGdcDaParam.fromJSON(e)) : [] };
  },

  toJSON(message: CfGdcDaParamList): unknown {
    const obj: any = {};
    if (message.params) {
      obj.params = message.params.map((e) => (e ? CfGdcDaParam.toJSON(e) : undefined));
    } else {
      obj.params = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CfGdcDaParamList>, I>>(object: I): CfGdcDaParamList {
    const message = createBaseCfGdcDaParamList();
    message.params = object.params?.map((e) => CfGdcDaParam.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCfGdcDaResultList(): CfGdcDaResultList {
  return { results: [] };
}

export const CfGdcDaResultList = {
  encode(message: CfGdcDaResultList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.results) {
      CfGdcDaResult.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CfGdcDaResultList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCfGdcDaResultList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.results.push(CfGdcDaResult.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CfGdcDaResultList {
    return { results: Array.isArray(object?.results) ? object.results.map((e: any) => CfGdcDaResult.fromJSON(e)) : [] };
  },

  toJSON(message: CfGdcDaResultList): unknown {
    const obj: any = {};
    if (message.results) {
      obj.results = message.results.map((e) => (e ? CfGdcDaResult.toJSON(e) : undefined));
    } else {
      obj.results = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CfGdcDaResultList>, I>>(object: I): CfGdcDaResultList {
    const message = createBaseCfGdcDaResultList();
    message.results = object.results?.map((e) => CfGdcDaResult.fromPartial(e)) || [];
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
