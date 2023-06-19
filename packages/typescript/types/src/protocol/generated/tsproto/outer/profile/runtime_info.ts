/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';
import { Timestamp } from '../../google/protobuf/timestamp';
import { Platform, platformFromJSON, platformToJSON } from '../platform';
import { RuntimeProcessInfo } from './runtime_process_info';

export interface RuntimeInfoCpu {
  name: string;
  currentLoad: number;
  currentLoadUser: number;
  currentLoadSystem: number;
  currentLoadNice: number;
  currentLoadIdle: number;
  currentLoadIrq: number;
  currentLoadCpu: number;
}

export interface RuntimeInfoCpuFreq {
  idx: number;
  min: number;
  cur: number;
  max: number;
}

export interface RuntimeInfoGpu {
  desc: string;
}

export interface RuntimeInfoMem {
  name: string;
  total: number;
  free: number;
  used: number;
  active: number;
  available: number;
  swaptotal: number;
  swapused: number;
  swapfree: number;
  isLow: boolean;
}

export interface RuntimeInfoFs {
  name: string;
  type: string;
  mount: string;
  size: number;
  used: number;
  available: number;
  use: number;
  readsCompleted: number;
  timeSpentReadMs: number;
  writesCompleted: number;
  timeSpentWriteMs: number;
}

export interface RuntimeInfoNet {
  name: string;
  mobileRxbytes: number;
  mobileTxbytes: number;
  wifiRxbytes: number;
  wifiTxbytes: number;
  totalRxbytes: number;
  totalTxbytes: number;
}

export interface RuntimeInfoDisplay {
  name: string;
  isScreenOn: boolean;
}

export interface RuntimeInfoBattery {
  name: string;
  percent: number;
}

export interface RuntimeInfo {
  platform?: Platform | undefined;
  localTimeStamp?: Date | undefined;
  cpues: RuntimeInfoCpu[];
  cpufreqs: RuntimeInfoCpuFreq[];
  gpues: RuntimeInfoGpu[];
  mems: RuntimeInfoMem[];
  fses: RuntimeInfoFs[];
  nets: RuntimeInfoNet[];
  displays: RuntimeInfoDisplay[];
  batteries: RuntimeInfoBattery[];
  processes: RuntimeProcessInfo[];
}

function createBaseRuntimeInfoCpu(): RuntimeInfoCpu {
  return {
    name: '',
    currentLoad: 0,
    currentLoadUser: 0,
    currentLoadSystem: 0,
    currentLoadNice: 0,
    currentLoadIdle: 0,
    currentLoadIrq: 0,
    currentLoadCpu: 0,
  };
}

export const RuntimeInfoCpu = {
  encode(message: RuntimeInfoCpu, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.currentLoad !== 0) {
      writer.uint32(17).fixed64(message.currentLoad);
    }
    if (message.currentLoadUser !== 0) {
      writer.uint32(25).fixed64(message.currentLoadUser);
    }
    if (message.currentLoadSystem !== 0) {
      writer.uint32(33).fixed64(message.currentLoadSystem);
    }
    if (message.currentLoadNice !== 0) {
      writer.uint32(41).fixed64(message.currentLoadNice);
    }
    if (message.currentLoadIdle !== 0) {
      writer.uint32(49).fixed64(message.currentLoadIdle);
    }
    if (message.currentLoadIrq !== 0) {
      writer.uint32(57).fixed64(message.currentLoadIrq);
    }
    if (message.currentLoadCpu !== 0) {
      writer.uint32(65).fixed64(message.currentLoadCpu);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoCpu {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeInfoCpu();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.currentLoad = longToNumber(reader.fixed64() as Long);
          break;
        case 3:
          message.currentLoadUser = longToNumber(reader.fixed64() as Long);
          break;
        case 4:
          message.currentLoadSystem = longToNumber(reader.fixed64() as Long);
          break;
        case 5:
          message.currentLoadNice = longToNumber(reader.fixed64() as Long);
          break;
        case 6:
          message.currentLoadIdle = longToNumber(reader.fixed64() as Long);
          break;
        case 7:
          message.currentLoadIrq = longToNumber(reader.fixed64() as Long);
          break;
        case 8:
          message.currentLoadCpu = longToNumber(reader.fixed64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeInfoCpu {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      currentLoad: isSet(object.currentLoad) ? Number(object.currentLoad) : 0,
      currentLoadUser: isSet(object.currentLoadUser) ? Number(object.currentLoadUser) : 0,
      currentLoadSystem: isSet(object.currentLoadSystem) ? Number(object.currentLoadSystem) : 0,
      currentLoadNice: isSet(object.currentLoadNice) ? Number(object.currentLoadNice) : 0,
      currentLoadIdle: isSet(object.currentLoadIdle) ? Number(object.currentLoadIdle) : 0,
      currentLoadIrq: isSet(object.currentLoadIrq) ? Number(object.currentLoadIrq) : 0,
      currentLoadCpu: isSet(object.currentLoadCpu) ? Number(object.currentLoadCpu) : 0,
    };
  },

  toJSON(message: RuntimeInfoCpu): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.currentLoad !== undefined && (obj.currentLoad = Math.round(message.currentLoad));
    message.currentLoadUser !== undefined && (obj.currentLoadUser = Math.round(message.currentLoadUser));
    message.currentLoadSystem !== undefined && (obj.currentLoadSystem = Math.round(message.currentLoadSystem));
    message.currentLoadNice !== undefined && (obj.currentLoadNice = Math.round(message.currentLoadNice));
    message.currentLoadIdle !== undefined && (obj.currentLoadIdle = Math.round(message.currentLoadIdle));
    message.currentLoadIrq !== undefined && (obj.currentLoadIrq = Math.round(message.currentLoadIrq));
    message.currentLoadCpu !== undefined && (obj.currentLoadCpu = Math.round(message.currentLoadCpu));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeInfoCpu>, I>>(object: I): RuntimeInfoCpu {
    const message = createBaseRuntimeInfoCpu();
    message.name = object.name ?? '';
    message.currentLoad = object.currentLoad ?? 0;
    message.currentLoadUser = object.currentLoadUser ?? 0;
    message.currentLoadSystem = object.currentLoadSystem ?? 0;
    message.currentLoadNice = object.currentLoadNice ?? 0;
    message.currentLoadIdle = object.currentLoadIdle ?? 0;
    message.currentLoadIrq = object.currentLoadIrq ?? 0;
    message.currentLoadCpu = object.currentLoadCpu ?? 0;
    return message;
  },
};

function createBaseRuntimeInfoCpuFreq(): RuntimeInfoCpuFreq {
  return { idx: 0, min: 0, cur: 0, max: 0 };
}

export const RuntimeInfoCpuFreq = {
  encode(message: RuntimeInfoCpuFreq, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.idx !== 0) {
      writer.uint32(13).fixed32(message.idx);
    }
    if (message.min !== 0) {
      writer.uint32(17).fixed64(message.min);
    }
    if (message.cur !== 0) {
      writer.uint32(25).fixed64(message.cur);
    }
    if (message.max !== 0) {
      writer.uint32(33).fixed64(message.max);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoCpuFreq {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeInfoCpuFreq();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.idx = reader.fixed32();
          break;
        case 2:
          message.min = longToNumber(reader.fixed64() as Long);
          break;
        case 3:
          message.cur = longToNumber(reader.fixed64() as Long);
          break;
        case 4:
          message.max = longToNumber(reader.fixed64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeInfoCpuFreq {
    return {
      idx: isSet(object.idx) ? Number(object.idx) : 0,
      min: isSet(object.min) ? Number(object.min) : 0,
      cur: isSet(object.cur) ? Number(object.cur) : 0,
      max: isSet(object.max) ? Number(object.max) : 0,
    };
  },

  toJSON(message: RuntimeInfoCpuFreq): unknown {
    const obj: any = {};
    message.idx !== undefined && (obj.idx = Math.round(message.idx));
    message.min !== undefined && (obj.min = Math.round(message.min));
    message.cur !== undefined && (obj.cur = Math.round(message.cur));
    message.max !== undefined && (obj.max = Math.round(message.max));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeInfoCpuFreq>, I>>(object: I): RuntimeInfoCpuFreq {
    const message = createBaseRuntimeInfoCpuFreq();
    message.idx = object.idx ?? 0;
    message.min = object.min ?? 0;
    message.cur = object.cur ?? 0;
    message.max = object.max ?? 0;
    return message;
  },
};

function createBaseRuntimeInfoGpu(): RuntimeInfoGpu {
  return { desc: '' };
}

export const RuntimeInfoGpu = {
  encode(message: RuntimeInfoGpu, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.desc !== '') {
      writer.uint32(10).string(message.desc);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoGpu {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeInfoGpu();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.desc = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeInfoGpu {
    return { desc: isSet(object.desc) ? String(object.desc) : '' };
  },

  toJSON(message: RuntimeInfoGpu): unknown {
    const obj: any = {};
    message.desc !== undefined && (obj.desc = message.desc);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeInfoGpu>, I>>(object: I): RuntimeInfoGpu {
    const message = createBaseRuntimeInfoGpu();
    message.desc = object.desc ?? '';
    return message;
  },
};

function createBaseRuntimeInfoMem(): RuntimeInfoMem {
  return {
    name: '',
    total: 0,
    free: 0,
    used: 0,
    active: 0,
    available: 0,
    swaptotal: 0,
    swapused: 0,
    swapfree: 0,
    isLow: false,
  };
}

export const RuntimeInfoMem = {
  encode(message: RuntimeInfoMem, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.total !== 0) {
      writer.uint32(17).fixed64(message.total);
    }
    if (message.free !== 0) {
      writer.uint32(25).fixed64(message.free);
    }
    if (message.used !== 0) {
      writer.uint32(33).fixed64(message.used);
    }
    if (message.active !== 0) {
      writer.uint32(41).fixed64(message.active);
    }
    if (message.available !== 0) {
      writer.uint32(49).fixed64(message.available);
    }
    if (message.swaptotal !== 0) {
      writer.uint32(57).fixed64(message.swaptotal);
    }
    if (message.swapused !== 0) {
      writer.uint32(65).fixed64(message.swapused);
    }
    if (message.swapfree !== 0) {
      writer.uint32(73).fixed64(message.swapfree);
    }
    if (message.isLow === true) {
      writer.uint32(80).bool(message.isLow);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoMem {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeInfoMem();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.total = longToNumber(reader.fixed64() as Long);
          break;
        case 3:
          message.free = longToNumber(reader.fixed64() as Long);
          break;
        case 4:
          message.used = longToNumber(reader.fixed64() as Long);
          break;
        case 5:
          message.active = longToNumber(reader.fixed64() as Long);
          break;
        case 6:
          message.available = longToNumber(reader.fixed64() as Long);
          break;
        case 7:
          message.swaptotal = longToNumber(reader.fixed64() as Long);
          break;
        case 8:
          message.swapused = longToNumber(reader.fixed64() as Long);
          break;
        case 9:
          message.swapfree = longToNumber(reader.fixed64() as Long);
          break;
        case 10:
          message.isLow = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeInfoMem {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      total: isSet(object.total) ? Number(object.total) : 0,
      free: isSet(object.free) ? Number(object.free) : 0,
      used: isSet(object.used) ? Number(object.used) : 0,
      active: isSet(object.active) ? Number(object.active) : 0,
      available: isSet(object.available) ? Number(object.available) : 0,
      swaptotal: isSet(object.swaptotal) ? Number(object.swaptotal) : 0,
      swapused: isSet(object.swapused) ? Number(object.swapused) : 0,
      swapfree: isSet(object.swapfree) ? Number(object.swapfree) : 0,
      isLow: isSet(object.isLow) ? Boolean(object.isLow) : false,
    };
  },

  toJSON(message: RuntimeInfoMem): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.total !== undefined && (obj.total = Math.round(message.total));
    message.free !== undefined && (obj.free = Math.round(message.free));
    message.used !== undefined && (obj.used = Math.round(message.used));
    message.active !== undefined && (obj.active = Math.round(message.active));
    message.available !== undefined && (obj.available = Math.round(message.available));
    message.swaptotal !== undefined && (obj.swaptotal = Math.round(message.swaptotal));
    message.swapused !== undefined && (obj.swapused = Math.round(message.swapused));
    message.swapfree !== undefined && (obj.swapfree = Math.round(message.swapfree));
    message.isLow !== undefined && (obj.isLow = message.isLow);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeInfoMem>, I>>(object: I): RuntimeInfoMem {
    const message = createBaseRuntimeInfoMem();
    message.name = object.name ?? '';
    message.total = object.total ?? 0;
    message.free = object.free ?? 0;
    message.used = object.used ?? 0;
    message.active = object.active ?? 0;
    message.available = object.available ?? 0;
    message.swaptotal = object.swaptotal ?? 0;
    message.swapused = object.swapused ?? 0;
    message.swapfree = object.swapfree ?? 0;
    message.isLow = object.isLow ?? false;
    return message;
  },
};

function createBaseRuntimeInfoFs(): RuntimeInfoFs {
  return {
    name: '',
    type: '',
    mount: '',
    size: 0,
    used: 0,
    available: 0,
    use: 0,
    readsCompleted: 0,
    timeSpentReadMs: 0,
    writesCompleted: 0,
    timeSpentWriteMs: 0,
  };
}

export const RuntimeInfoFs = {
  encode(message: RuntimeInfoFs, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.type !== '') {
      writer.uint32(18).string(message.type);
    }
    if (message.mount !== '') {
      writer.uint32(26).string(message.mount);
    }
    if (message.size !== 0) {
      writer.uint32(33).fixed64(message.size);
    }
    if (message.used !== 0) {
      writer.uint32(41).fixed64(message.used);
    }
    if (message.available !== 0) {
      writer.uint32(49).fixed64(message.available);
    }
    if (message.use !== 0) {
      writer.uint32(57).fixed64(message.use);
    }
    if (message.readsCompleted !== 0) {
      writer.uint32(65).fixed64(message.readsCompleted);
    }
    if (message.timeSpentReadMs !== 0) {
      writer.uint32(73).fixed64(message.timeSpentReadMs);
    }
    if (message.writesCompleted !== 0) {
      writer.uint32(81).fixed64(message.writesCompleted);
    }
    if (message.timeSpentWriteMs !== 0) {
      writer.uint32(89).fixed64(message.timeSpentWriteMs);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoFs {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeInfoFs();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.type = reader.string();
          break;
        case 3:
          message.mount = reader.string();
          break;
        case 4:
          message.size = longToNumber(reader.fixed64() as Long);
          break;
        case 5:
          message.used = longToNumber(reader.fixed64() as Long);
          break;
        case 6:
          message.available = longToNumber(reader.fixed64() as Long);
          break;
        case 7:
          message.use = longToNumber(reader.fixed64() as Long);
          break;
        case 8:
          message.readsCompleted = longToNumber(reader.fixed64() as Long);
          break;
        case 9:
          message.timeSpentReadMs = longToNumber(reader.fixed64() as Long);
          break;
        case 10:
          message.writesCompleted = longToNumber(reader.fixed64() as Long);
          break;
        case 11:
          message.timeSpentWriteMs = longToNumber(reader.fixed64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeInfoFs {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      type: isSet(object.type) ? String(object.type) : '',
      mount: isSet(object.mount) ? String(object.mount) : '',
      size: isSet(object.size) ? Number(object.size) : 0,
      used: isSet(object.used) ? Number(object.used) : 0,
      available: isSet(object.available) ? Number(object.available) : 0,
      use: isSet(object.use) ? Number(object.use) : 0,
      readsCompleted: isSet(object.readsCompleted) ? Number(object.readsCompleted) : 0,
      timeSpentReadMs: isSet(object.timeSpentReadMs) ? Number(object.timeSpentReadMs) : 0,
      writesCompleted: isSet(object.writesCompleted) ? Number(object.writesCompleted) : 0,
      timeSpentWriteMs: isSet(object.timeSpentWriteMs) ? Number(object.timeSpentWriteMs) : 0,
    };
  },

  toJSON(message: RuntimeInfoFs): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.type !== undefined && (obj.type = message.type);
    message.mount !== undefined && (obj.mount = message.mount);
    message.size !== undefined && (obj.size = Math.round(message.size));
    message.used !== undefined && (obj.used = Math.round(message.used));
    message.available !== undefined && (obj.available = Math.round(message.available));
    message.use !== undefined && (obj.use = Math.round(message.use));
    message.readsCompleted !== undefined && (obj.readsCompleted = Math.round(message.readsCompleted));
    message.timeSpentReadMs !== undefined && (obj.timeSpentReadMs = Math.round(message.timeSpentReadMs));
    message.writesCompleted !== undefined && (obj.writesCompleted = Math.round(message.writesCompleted));
    message.timeSpentWriteMs !== undefined && (obj.timeSpentWriteMs = Math.round(message.timeSpentWriteMs));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeInfoFs>, I>>(object: I): RuntimeInfoFs {
    const message = createBaseRuntimeInfoFs();
    message.name = object.name ?? '';
    message.type = object.type ?? '';
    message.mount = object.mount ?? '';
    message.size = object.size ?? 0;
    message.used = object.used ?? 0;
    message.available = object.available ?? 0;
    message.use = object.use ?? 0;
    message.readsCompleted = object.readsCompleted ?? 0;
    message.timeSpentReadMs = object.timeSpentReadMs ?? 0;
    message.writesCompleted = object.writesCompleted ?? 0;
    message.timeSpentWriteMs = object.timeSpentWriteMs ?? 0;
    return message;
  },
};

function createBaseRuntimeInfoNet(): RuntimeInfoNet {
  return {
    name: '',
    mobileRxbytes: 0,
    mobileTxbytes: 0,
    wifiRxbytes: 0,
    wifiTxbytes: 0,
    totalRxbytes: 0,
    totalTxbytes: 0,
  };
}

export const RuntimeInfoNet = {
  encode(message: RuntimeInfoNet, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.mobileRxbytes !== 0) {
      writer.uint32(17).fixed64(message.mobileRxbytes);
    }
    if (message.mobileTxbytes !== 0) {
      writer.uint32(25).fixed64(message.mobileTxbytes);
    }
    if (message.wifiRxbytes !== 0) {
      writer.uint32(33).fixed64(message.wifiRxbytes);
    }
    if (message.wifiTxbytes !== 0) {
      writer.uint32(41).fixed64(message.wifiTxbytes);
    }
    if (message.totalRxbytes !== 0) {
      writer.uint32(49).fixed64(message.totalRxbytes);
    }
    if (message.totalTxbytes !== 0) {
      writer.uint32(57).fixed64(message.totalTxbytes);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoNet {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeInfoNet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.mobileRxbytes = longToNumber(reader.fixed64() as Long);
          break;
        case 3:
          message.mobileTxbytes = longToNumber(reader.fixed64() as Long);
          break;
        case 4:
          message.wifiRxbytes = longToNumber(reader.fixed64() as Long);
          break;
        case 5:
          message.wifiTxbytes = longToNumber(reader.fixed64() as Long);
          break;
        case 6:
          message.totalRxbytes = longToNumber(reader.fixed64() as Long);
          break;
        case 7:
          message.totalTxbytes = longToNumber(reader.fixed64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeInfoNet {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      mobileRxbytes: isSet(object.mobileRxbytes) ? Number(object.mobileRxbytes) : 0,
      mobileTxbytes: isSet(object.mobileTxbytes) ? Number(object.mobileTxbytes) : 0,
      wifiRxbytes: isSet(object.wifiRxbytes) ? Number(object.wifiRxbytes) : 0,
      wifiTxbytes: isSet(object.wifiTxbytes) ? Number(object.wifiTxbytes) : 0,
      totalRxbytes: isSet(object.totalRxbytes) ? Number(object.totalRxbytes) : 0,
      totalTxbytes: isSet(object.totalTxbytes) ? Number(object.totalTxbytes) : 0,
    };
  },

  toJSON(message: RuntimeInfoNet): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.mobileRxbytes !== undefined && (obj.mobileRxbytes = Math.round(message.mobileRxbytes));
    message.mobileTxbytes !== undefined && (obj.mobileTxbytes = Math.round(message.mobileTxbytes));
    message.wifiRxbytes !== undefined && (obj.wifiRxbytes = Math.round(message.wifiRxbytes));
    message.wifiTxbytes !== undefined && (obj.wifiTxbytes = Math.round(message.wifiTxbytes));
    message.totalRxbytes !== undefined && (obj.totalRxbytes = Math.round(message.totalRxbytes));
    message.totalTxbytes !== undefined && (obj.totalTxbytes = Math.round(message.totalTxbytes));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeInfoNet>, I>>(object: I): RuntimeInfoNet {
    const message = createBaseRuntimeInfoNet();
    message.name = object.name ?? '';
    message.mobileRxbytes = object.mobileRxbytes ?? 0;
    message.mobileTxbytes = object.mobileTxbytes ?? 0;
    message.wifiRxbytes = object.wifiRxbytes ?? 0;
    message.wifiTxbytes = object.wifiTxbytes ?? 0;
    message.totalRxbytes = object.totalRxbytes ?? 0;
    message.totalTxbytes = object.totalTxbytes ?? 0;
    return message;
  },
};

function createBaseRuntimeInfoDisplay(): RuntimeInfoDisplay {
  return { name: '', isScreenOn: false };
}

export const RuntimeInfoDisplay = {
  encode(message: RuntimeInfoDisplay, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.isScreenOn === true) {
      writer.uint32(16).bool(message.isScreenOn);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoDisplay {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeInfoDisplay();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.isScreenOn = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeInfoDisplay {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      isScreenOn: isSet(object.isScreenOn) ? Boolean(object.isScreenOn) : false,
    };
  },

  toJSON(message: RuntimeInfoDisplay): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.isScreenOn !== undefined && (obj.isScreenOn = message.isScreenOn);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeInfoDisplay>, I>>(object: I): RuntimeInfoDisplay {
    const message = createBaseRuntimeInfoDisplay();
    message.name = object.name ?? '';
    message.isScreenOn = object.isScreenOn ?? false;
    return message;
  },
};

function createBaseRuntimeInfoBattery(): RuntimeInfoBattery {
  return { name: '', percent: 0 };
}

export const RuntimeInfoBattery = {
  encode(message: RuntimeInfoBattery, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.percent !== 0) {
      writer.uint32(21).float(message.percent);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoBattery {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeInfoBattery();
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

  fromJSON(object: any): RuntimeInfoBattery {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      percent: isSet(object.percent) ? Number(object.percent) : 0,
    };
  },

  toJSON(message: RuntimeInfoBattery): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.percent !== undefined && (obj.percent = message.percent);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeInfoBattery>, I>>(object: I): RuntimeInfoBattery {
    const message = createBaseRuntimeInfoBattery();
    message.name = object.name ?? '';
    message.percent = object.percent ?? 0;
    return message;
  },
};

function createBaseRuntimeInfo(): RuntimeInfo {
  return {
    platform: undefined,
    localTimeStamp: undefined,
    cpues: [],
    cpufreqs: [],
    gpues: [],
    mems: [],
    fses: [],
    nets: [],
    displays: [],
    batteries: [],
    processes: [],
  };
}

export const RuntimeInfo = {
  encode(message: RuntimeInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.platform !== undefined) {
      writer.uint32(8).int32(message.platform);
    }
    if (message.localTimeStamp !== undefined) {
      Timestamp.encode(toTimestamp(message.localTimeStamp), writer.uint32(82).fork()).ldelim();
    }
    for (const v of message.cpues) {
      RuntimeInfoCpu.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.cpufreqs) {
      RuntimeInfoCpuFreq.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.gpues) {
      RuntimeInfoGpu.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.mems) {
      RuntimeInfoMem.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.fses) {
      RuntimeInfoFs.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.nets) {
      RuntimeInfoNet.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.displays) {
      RuntimeInfoDisplay.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.batteries) {
      RuntimeInfoBattery.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    for (const v of message.processes) {
      RuntimeProcessInfo.encode(v!, writer.uint32(90).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRuntimeInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.platform = reader.int32() as any;
          break;
        case 10:
          message.localTimeStamp = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 2:
          message.cpues.push(RuntimeInfoCpu.decode(reader, reader.uint32()));
          break;
        case 3:
          message.cpufreqs.push(RuntimeInfoCpuFreq.decode(reader, reader.uint32()));
          break;
        case 4:
          message.gpues.push(RuntimeInfoGpu.decode(reader, reader.uint32()));
          break;
        case 5:
          message.mems.push(RuntimeInfoMem.decode(reader, reader.uint32()));
          break;
        case 6:
          message.fses.push(RuntimeInfoFs.decode(reader, reader.uint32()));
          break;
        case 7:
          message.nets.push(RuntimeInfoNet.decode(reader, reader.uint32()));
          break;
        case 8:
          message.displays.push(RuntimeInfoDisplay.decode(reader, reader.uint32()));
          break;
        case 9:
          message.batteries.push(RuntimeInfoBattery.decode(reader, reader.uint32()));
          break;
        case 11:
          message.processes.push(RuntimeProcessInfo.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RuntimeInfo {
    return {
      platform: isSet(object.platform) ? platformFromJSON(object.platform) : undefined,
      localTimeStamp: isSet(object.localTimeStamp) ? fromJsonTimestamp(object.localTimeStamp) : undefined,
      cpues: Array.isArray(object?.cpues) ? object.cpues.map((e: any) => RuntimeInfoCpu.fromJSON(e)) : [],
      cpufreqs: Array.isArray(object?.cpufreqs) ? object.cpufreqs.map((e: any) => RuntimeInfoCpuFreq.fromJSON(e)) : [],
      gpues: Array.isArray(object?.gpues) ? object.gpues.map((e: any) => RuntimeInfoGpu.fromJSON(e)) : [],
      mems: Array.isArray(object?.mems) ? object.mems.map((e: any) => RuntimeInfoMem.fromJSON(e)) : [],
      fses: Array.isArray(object?.fses) ? object.fses.map((e: any) => RuntimeInfoFs.fromJSON(e)) : [],
      nets: Array.isArray(object?.nets) ? object.nets.map((e: any) => RuntimeInfoNet.fromJSON(e)) : [],
      displays: Array.isArray(object?.displays) ? object.displays.map((e: any) => RuntimeInfoDisplay.fromJSON(e)) : [],
      batteries: Array.isArray(object?.batteries) ? object.batteries.map((e: any) => RuntimeInfoBattery.fromJSON(e)) : [],
      processes: Array.isArray(object?.processes) ? object.processes.map((e: any) => RuntimeProcessInfo.fromJSON(e)) : [],
    };
  },

  toJSON(message: RuntimeInfo): unknown {
    const obj: any = {};
    message.platform !== undefined && (obj.platform = message.platform !== undefined ? platformToJSON(message.platform) : undefined);
    message.localTimeStamp !== undefined && (obj.localTimeStamp = message.localTimeStamp.toISOString());
    if (message.cpues) {
      obj.cpues = message.cpues.map((e) => (e ? RuntimeInfoCpu.toJSON(e) : undefined));
    } else {
      obj.cpues = [];
    }
    if (message.cpufreqs) {
      obj.cpufreqs = message.cpufreqs.map((e) => (e ? RuntimeInfoCpuFreq.toJSON(e) : undefined));
    } else {
      obj.cpufreqs = [];
    }
    if (message.gpues) {
      obj.gpues = message.gpues.map((e) => (e ? RuntimeInfoGpu.toJSON(e) : undefined));
    } else {
      obj.gpues = [];
    }
    if (message.mems) {
      obj.mems = message.mems.map((e) => (e ? RuntimeInfoMem.toJSON(e) : undefined));
    } else {
      obj.mems = [];
    }
    if (message.fses) {
      obj.fses = message.fses.map((e) => (e ? RuntimeInfoFs.toJSON(e) : undefined));
    } else {
      obj.fses = [];
    }
    if (message.nets) {
      obj.nets = message.nets.map((e) => (e ? RuntimeInfoNet.toJSON(e) : undefined));
    } else {
      obj.nets = [];
    }
    if (message.displays) {
      obj.displays = message.displays.map((e) => (e ? RuntimeInfoDisplay.toJSON(e) : undefined));
    } else {
      obj.displays = [];
    }
    if (message.batteries) {
      obj.batteries = message.batteries.map((e) => (e ? RuntimeInfoBattery.toJSON(e) : undefined));
    } else {
      obj.batteries = [];
    }
    if (message.processes) {
      obj.processes = message.processes.map((e) => (e ? RuntimeProcessInfo.toJSON(e) : undefined));
    } else {
      obj.processes = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RuntimeInfo>, I>>(object: I): RuntimeInfo {
    const message = createBaseRuntimeInfo();
    message.platform = object.platform ?? undefined;
    message.localTimeStamp = object.localTimeStamp ?? undefined;
    message.cpues = object.cpues?.map((e) => RuntimeInfoCpu.fromPartial(e)) || [];
    message.cpufreqs = object.cpufreqs?.map((e) => RuntimeInfoCpuFreq.fromPartial(e)) || [];
    message.gpues = object.gpues?.map((e) => RuntimeInfoGpu.fromPartial(e)) || [];
    message.mems = object.mems?.map((e) => RuntimeInfoMem.fromPartial(e)) || [];
    message.fses = object.fses?.map((e) => RuntimeInfoFs.fromPartial(e)) || [];
    message.nets = object.nets?.map((e) => RuntimeInfoNet.fromPartial(e)) || [];
    message.displays = object.displays?.map((e) => RuntimeInfoDisplay.fromPartial(e)) || [];
    message.batteries = object.batteries?.map((e) => RuntimeInfoBattery.fromPartial(e)) || [];
    message.processes = object.processes?.map((e) => RuntimeProcessInfo.fromPartial(e)) || [];
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

function toTimestamp(date: Date): Timestamp {
  const seconds = date.getTime() / 1_000;
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = t.seconds * 1_000;
  millis += t.nanos / 1_000_000;
  return new Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof Date) {
    return o;
  } else if (typeof o === 'string') {
    return new Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

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
