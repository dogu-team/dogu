/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export interface RuntimeProcessInfoCpu {
  name: string;
  percent: number;
}

export interface RuntimeProcessInfoMem {
  name: string;
  percent: number;
}

export interface RuntimeProcessInfoFs {
  name: string;
  writeBytes: number;
  readBytes: number;
}

export interface RuntimeProcessInfoNet {
  name: string;
  sendBytes: number;
  readBytes: number;
}

export interface RuntimeProcessInfo {
  name: string;
  pid: number;
  isForeground: boolean;
  cpues: RuntimeProcessInfoCpu[];
  mems: RuntimeProcessInfoMem[];
  fses: RuntimeProcessInfoFs[];
  nets: RuntimeProcessInfoNet[];
}

function createBaseRuntimeProcessInfoCpu(): RuntimeProcessInfoCpu {
  return { name: '', percent: 0 };
}

export const RuntimeProcessInfoCpu = {
  encode(message: RuntimeProcessInfoCpu, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.percent !== 0) {
      writer.uint32(21).float(message.percent);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeProcessInfoCpu {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeProcessInfoCpu();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.percent = reader.float();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeProcessInfoCpu {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      percent: isSet(object.percent) ? Number(object.percent) : 0,
    };
  },

  toJSON(message: RuntimeProcessInfoCpu): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.percent !== undefined && (obj.percent = message.percent);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeProcessInfoCpu>, I>>(object: I): RuntimeProcessInfoCpu {
    const message = createBaseRuntimeProcessInfoCpu();
    message.name = object.name ?? '';
    message.percent = object.percent ?? 0;
    return message;
  },
};

function createBaseRuntimeProcessInfoMem(): RuntimeProcessInfoMem {
  return { name: '', percent: 0 };
}

export const RuntimeProcessInfoMem = {
  encode(message: RuntimeProcessInfoMem, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.percent !== 0) {
      writer.uint32(21).float(message.percent);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeProcessInfoMem {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeProcessInfoMem();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.percent = reader.float();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeProcessInfoMem {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      percent: isSet(object.percent) ? Number(object.percent) : 0,
    };
  },

  toJSON(message: RuntimeProcessInfoMem): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.percent !== undefined && (obj.percent = message.percent);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeProcessInfoMem>, I>>(object: I): RuntimeProcessInfoMem {
    const message = createBaseRuntimeProcessInfoMem();
    message.name = object.name ?? '';
    message.percent = object.percent ?? 0;
    return message;
  },
};

function createBaseRuntimeProcessInfoFs(): RuntimeProcessInfoFs {
  return { name: '', writeBytes: 0, readBytes: 0 };
}

export const RuntimeProcessInfoFs = {
  encode(message: RuntimeProcessInfoFs, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.writeBytes !== 0) {
      writer.uint32(17).fixed64(message.writeBytes);
    }
    if (message.readBytes !== 0) {
      writer.uint32(25).fixed64(message.readBytes);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeProcessInfoFs {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeProcessInfoFs();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.writeBytes = longToNumber(reader.fixed64() as Long);
          break;
        case 3:
          message.readBytes = longToNumber(reader.fixed64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeProcessInfoFs {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      writeBytes: isSet(object.writeBytes) ? Number(object.writeBytes) : 0,
      readBytes: isSet(object.readBytes) ? Number(object.readBytes) : 0,
    };
  },

  toJSON(message: RuntimeProcessInfoFs): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.writeBytes !== undefined && (obj.writeBytes = Math.round(message.writeBytes));
    message.readBytes !== undefined && (obj.readBytes = Math.round(message.readBytes));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeProcessInfoFs>, I>>(object: I): RuntimeProcessInfoFs {
    const message = createBaseRuntimeProcessInfoFs();
    message.name = object.name ?? '';
    message.writeBytes = object.writeBytes ?? 0;
    message.readBytes = object.readBytes ?? 0;
    return message;
  },
};

function createBaseRuntimeProcessInfoNet(): RuntimeProcessInfoNet {
  return { name: '', sendBytes: 0, readBytes: 0 };
}

export const RuntimeProcessInfoNet = {
  encode(message: RuntimeProcessInfoNet, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.sendBytes !== 0) {
      writer.uint32(17).fixed64(message.sendBytes);
    }
    if (message.readBytes !== 0) {
      writer.uint32(25).fixed64(message.readBytes);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeProcessInfoNet {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeProcessInfoNet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.sendBytes = longToNumber(reader.fixed64() as Long);
          break;
        case 3:
          message.readBytes = longToNumber(reader.fixed64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeProcessInfoNet {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      sendBytes: isSet(object.sendBytes) ? Number(object.sendBytes) : 0,
      readBytes: isSet(object.readBytes) ? Number(object.readBytes) : 0,
    };
  },

  toJSON(message: RuntimeProcessInfoNet): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.sendBytes !== undefined && (obj.sendBytes = Math.round(message.sendBytes));
    message.readBytes !== undefined && (obj.readBytes = Math.round(message.readBytes));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeProcessInfoNet>, I>>(object: I): RuntimeProcessInfoNet {
    const message = createBaseRuntimeProcessInfoNet();
    message.name = object.name ?? '';
    message.sendBytes = object.sendBytes ?? 0;
    message.readBytes = object.readBytes ?? 0;
    return message;
  },
};

function createBaseRuntimeProcessInfo(): RuntimeProcessInfo {
  return { name: '', pid: 0, isForeground: false, cpues: [], mems: [], fses: [], nets: [] };
}

export const RuntimeProcessInfo = {
  encode(message: RuntimeProcessInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.pid !== 0) {
      writer.uint32(21).fixed32(message.pid);
    }
    if (message.isForeground === true) {
      writer.uint32(24).bool(message.isForeground);
    }
    for (const v of message.cpues) {
      RuntimeProcessInfoCpu.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.mems) {
      RuntimeProcessInfoMem.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.fses) {
      RuntimeProcessInfoFs.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.nets) {
      RuntimeProcessInfoNet.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeProcessInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeProcessInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.pid = reader.fixed32();
          break;
        case 3:
          message.isForeground = reader.bool();
          break;
        case 5:
          message.cpues.push(RuntimeProcessInfoCpu.decode(reader, reader.uint32()));
          break;
        case 6:
          message.mems.push(RuntimeProcessInfoMem.decode(reader, reader.uint32()));
          break;
        case 7:
          message.fses.push(RuntimeProcessInfoFs.decode(reader, reader.uint32()));
          break;
        case 8:
          message.nets.push(RuntimeProcessInfoNet.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeProcessInfo {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      pid: isSet(object.pid) ? Number(object.pid) : 0,
      isForeground: isSet(object.isForeground) ? Boolean(object.isForeground) : false,
      cpues: Array.isArray(object?.cpues) ? object.cpues.map((e: any) => RuntimeProcessInfoCpu.fromJSON(e)) : [],
      mems: Array.isArray(object?.mems) ? object.mems.map((e: any) => RuntimeProcessInfoMem.fromJSON(e)) : [],
      fses: Array.isArray(object?.fses) ? object.fses.map((e: any) => RuntimeProcessInfoFs.fromJSON(e)) : [],
      nets: Array.isArray(object?.nets) ? object.nets.map((e: any) => RuntimeProcessInfoNet.fromJSON(e)) : [],
    };
  },

  toJSON(message: RuntimeProcessInfo): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.pid !== undefined && (obj.pid = Math.round(message.pid));
    message.isForeground !== undefined && (obj.isForeground = message.isForeground);
    if (message.cpues) {
      obj.cpues = message.cpues.map((e) => (e ? RuntimeProcessInfoCpu.toJSON(e) : undefined));
    } else {
      obj.cpues = [];
    }
    if (message.mems) {
      obj.mems = message.mems.map((e) => (e ? RuntimeProcessInfoMem.toJSON(e) : undefined));
    } else {
      obj.mems = [];
    }
    if (message.fses) {
      obj.fses = message.fses.map((e) => (e ? RuntimeProcessInfoFs.toJSON(e) : undefined));
    } else {
      obj.fses = [];
    }
    if (message.nets) {
      obj.nets = message.nets.map((e) => (e ? RuntimeProcessInfoNet.toJSON(e) : undefined));
    } else {
      obj.nets = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeProcessInfo>, I>>(object: I): RuntimeProcessInfo {
    const message = createBaseRuntimeProcessInfo();
    message.name = object.name ?? '';
    message.pid = object.pid ?? 0;
    message.isForeground = object.isForeground ?? false;
    message.cpues = object.cpues?.map((e) => RuntimeProcessInfoCpu.fromPartial(e)) || [];
    message.mems = object.mems?.map((e) => RuntimeProcessInfoMem.fromPartial(e)) || [];
    message.fses = object.fses?.map((e) => RuntimeProcessInfoFs.fromPartial(e)) || [];
    message.nets = object.nets?.map((e) => RuntimeProcessInfoNet.fromPartial(e)) || [];
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
