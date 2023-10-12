/* eslint-disable */
import _m0 from 'protobufjs/minimal';

export enum ProfileMethodKind {
  PROFILE_METHOD_KIND_UNSPECIFIED = 0,
  PROFILE_METHOD_KIND_DESKTOP_CPU = 1,
  PROFILE_METHOD_KIND_DESKTOP_CPUFREQ = 10,
  PROFILE_METHOD_KIND_DESKTOP_GPU = 20,
  PROFILE_METHOD_KIND_DESKTOP_MEM = 30,
  PROFILE_METHOD_KIND_DESKTOP_FS = 40,
  PROFILE_METHOD_KIND_DESKTOP_NET = 50,
  PROFILE_METHOD_KIND_DESKTOP_DISPLAY = 60,
  PROFILE_METHOD_KIND_ANDROID_CPU_SHELLTOP = 1001,
  PROFILE_METHOD_KIND_ANDROID_CPUFREQ_CAT = 1010,
  PROFILE_METHOD_KIND_ANDROID_GPU_NOTYET = 1020,
  PROFILE_METHOD_KIND_ANDROID_MEM_ACTIVITYMANAGER = 1030,
  PROFILE_METHOD_KIND_ANDROID_MEM_PROCMEMINFO = 1031,
  PROFILE_METHOD_KIND_ANDROID_FS_PROCDISKSTATS = 1040,
  PROFILE_METHOD_KIND_ANDROID_NET_TRAFFICSTATS = 1050,
  PROFILE_METHOD_KIND_ANDROID_DISPLAY = 1060,
  PROFILE_METHOD_KIND_ANDROID_PROCESS_SHELLTOP = 1070,
  PROFILE_METHOD_KIND_ANDROID_BLOCK_DEVELOPER_OPTIONS = 1080,
  PROFILE_METHOD_KIND_IOS_CPU_LOAD_INFO = 2001,
  PROFILE_METHOD_KIND_IOS_MEM_VM_STATISTICS = 2030,
  PROFILE_METHOD_KIND_IOS_DISPLAY = 2060,
  UNRECOGNIZED = -1,
}

export function profileMethodKindFromJSON(object: any): ProfileMethodKind {
  switch (object) {
    case 0:
    case 'PROFILE_METHOD_KIND_UNSPECIFIED':
      return ProfileMethodKind.PROFILE_METHOD_KIND_UNSPECIFIED;
    case 1:
    case 'PROFILE_METHOD_KIND_DESKTOP_CPU':
      return ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_CPU;
    case 10:
    case 'PROFILE_METHOD_KIND_DESKTOP_CPUFREQ':
      return ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_CPUFREQ;
    case 20:
    case 'PROFILE_METHOD_KIND_DESKTOP_GPU':
      return ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_GPU;
    case 30:
    case 'PROFILE_METHOD_KIND_DESKTOP_MEM':
      return ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_MEM;
    case 40:
    case 'PROFILE_METHOD_KIND_DESKTOP_FS':
      return ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_FS;
    case 50:
    case 'PROFILE_METHOD_KIND_DESKTOP_NET':
      return ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_NET;
    case 60:
    case 'PROFILE_METHOD_KIND_DESKTOP_DISPLAY':
      return ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_DISPLAY;
    case 1001:
    case 'PROFILE_METHOD_KIND_ANDROID_CPU_SHELLTOP':
      return ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_CPU_SHELLTOP;
    case 1010:
    case 'PROFILE_METHOD_KIND_ANDROID_CPUFREQ_CAT':
      return ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_CPUFREQ_CAT;
    case 1020:
    case 'PROFILE_METHOD_KIND_ANDROID_GPU_NOTYET':
      return ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_GPU_NOTYET;
    case 1030:
    case 'PROFILE_METHOD_KIND_ANDROID_MEM_ACTIVITYMANAGER':
      return ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_MEM_ACTIVITYMANAGER;
    case 1031:
    case 'PROFILE_METHOD_KIND_ANDROID_MEM_PROCMEMINFO':
      return ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_MEM_PROCMEMINFO;
    case 1040:
    case 'PROFILE_METHOD_KIND_ANDROID_FS_PROCDISKSTATS':
      return ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_FS_PROCDISKSTATS;
    case 1050:
    case 'PROFILE_METHOD_KIND_ANDROID_NET_TRAFFICSTATS':
      return ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_NET_TRAFFICSTATS;
    case 1060:
    case 'PROFILE_METHOD_KIND_ANDROID_DISPLAY':
      return ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_DISPLAY;
    case 1070:
    case 'PROFILE_METHOD_KIND_ANDROID_PROCESS_SHELLTOP':
      return ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_PROCESS_SHELLTOP;
    case 1080:
    case 'PROFILE_METHOD_KIND_ANDROID_BLOCK_DEVELOPER_OPTIONS':
      return ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_BLOCK_DEVELOPER_OPTIONS;
    case 2001:
    case 'PROFILE_METHOD_KIND_IOS_CPU_LOAD_INFO':
      return ProfileMethodKind.PROFILE_METHOD_KIND_IOS_CPU_LOAD_INFO;
    case 2030:
    case 'PROFILE_METHOD_KIND_IOS_MEM_VM_STATISTICS':
      return ProfileMethodKind.PROFILE_METHOD_KIND_IOS_MEM_VM_STATISTICS;
    case 2060:
    case 'PROFILE_METHOD_KIND_IOS_DISPLAY':
      return ProfileMethodKind.PROFILE_METHOD_KIND_IOS_DISPLAY;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ProfileMethodKind.UNRECOGNIZED;
  }
}

export function profileMethodKindToJSON(object: ProfileMethodKind): string {
  switch (object) {
    case ProfileMethodKind.PROFILE_METHOD_KIND_UNSPECIFIED:
      return 'PROFILE_METHOD_KIND_UNSPECIFIED';
    case ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_CPU:
      return 'PROFILE_METHOD_KIND_DESKTOP_CPU';
    case ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_CPUFREQ:
      return 'PROFILE_METHOD_KIND_DESKTOP_CPUFREQ';
    case ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_GPU:
      return 'PROFILE_METHOD_KIND_DESKTOP_GPU';
    case ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_MEM:
      return 'PROFILE_METHOD_KIND_DESKTOP_MEM';
    case ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_FS:
      return 'PROFILE_METHOD_KIND_DESKTOP_FS';
    case ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_NET:
      return 'PROFILE_METHOD_KIND_DESKTOP_NET';
    case ProfileMethodKind.PROFILE_METHOD_KIND_DESKTOP_DISPLAY:
      return 'PROFILE_METHOD_KIND_DESKTOP_DISPLAY';
    case ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_CPU_SHELLTOP:
      return 'PROFILE_METHOD_KIND_ANDROID_CPU_SHELLTOP';
    case ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_CPUFREQ_CAT:
      return 'PROFILE_METHOD_KIND_ANDROID_CPUFREQ_CAT';
    case ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_GPU_NOTYET:
      return 'PROFILE_METHOD_KIND_ANDROID_GPU_NOTYET';
    case ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_MEM_ACTIVITYMANAGER:
      return 'PROFILE_METHOD_KIND_ANDROID_MEM_ACTIVITYMANAGER';
    case ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_MEM_PROCMEMINFO:
      return 'PROFILE_METHOD_KIND_ANDROID_MEM_PROCMEMINFO';
    case ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_FS_PROCDISKSTATS:
      return 'PROFILE_METHOD_KIND_ANDROID_FS_PROCDISKSTATS';
    case ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_NET_TRAFFICSTATS:
      return 'PROFILE_METHOD_KIND_ANDROID_NET_TRAFFICSTATS';
    case ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_DISPLAY:
      return 'PROFILE_METHOD_KIND_ANDROID_DISPLAY';
    case ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_PROCESS_SHELLTOP:
      return 'PROFILE_METHOD_KIND_ANDROID_PROCESS_SHELLTOP';
    case ProfileMethodKind.PROFILE_METHOD_KIND_ANDROID_BLOCK_DEVELOPER_OPTIONS:
      return 'PROFILE_METHOD_KIND_ANDROID_BLOCK_DEVELOPER_OPTIONS';
    case ProfileMethodKind.PROFILE_METHOD_KIND_IOS_CPU_LOAD_INFO:
      return 'PROFILE_METHOD_KIND_IOS_CPU_LOAD_INFO';
    case ProfileMethodKind.PROFILE_METHOD_KIND_IOS_MEM_VM_STATISTICS:
      return 'PROFILE_METHOD_KIND_IOS_MEM_VM_STATISTICS';
    case ProfileMethodKind.PROFILE_METHOD_KIND_IOS_DISPLAY:
      return 'PROFILE_METHOD_KIND_IOS_DISPLAY';
    case ProfileMethodKind.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

export interface ProfileMethod {
  kind: ProfileMethodKind;
  name: string;
}

export interface ProfileMethodWithConfig {
  profileMethod: ProfileMethod | undefined;
  periodSec: number;
}

export interface DeviceConfig {
  profileMethods: ProfileMethodWithConfig[];
}

function createBaseProfileMethod(): ProfileMethod {
  return { kind: 0, name: '' };
}

export const ProfileMethod = {
  encode(message: ProfileMethod, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.kind !== 0) {
      writer.uint32(8).int32(message.kind);
    }
    if (message.name !== '') {
      writer.uint32(18).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProfileMethod {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProfileMethod();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.kind = reader.int32() as any;
          break;
        case 2:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProfileMethod {
    return {
      kind: isSet(object.kind) ? profileMethodKindFromJSON(object.kind) : 0,
      name: isSet(object.name) ? String(object.name) : '',
    };
  },

  toJSON(message: ProfileMethod): unknown {
    const obj: any = {};
    message.kind !== undefined && (obj.kind = profileMethodKindToJSON(message.kind));
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ProfileMethod>, I>>(object: I): ProfileMethod {
    const message = createBaseProfileMethod();
    message.kind = object.kind ?? 0;
    message.name = object.name ?? '';
    return message;
  },
};

function createBaseProfileMethodWithConfig(): ProfileMethodWithConfig {
  return { profileMethod: undefined, periodSec: 0 };
}

export const ProfileMethodWithConfig = {
  encode(message: ProfileMethodWithConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.profileMethod !== undefined) {
      ProfileMethod.encode(message.profileMethod, writer.uint32(10).fork()).ldelim();
    }
    if (message.periodSec !== 0) {
      writer.uint32(21).fixed32(message.periodSec);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProfileMethodWithConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProfileMethodWithConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.profileMethod = ProfileMethod.decode(reader, reader.uint32());
          break;
        case 2:
          message.periodSec = reader.fixed32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProfileMethodWithConfig {
    return {
      profileMethod: isSet(object.profileMethod) ? ProfileMethod.fromJSON(object.profileMethod) : undefined,
      periodSec: isSet(object.periodSec) ? Number(object.periodSec) : 0,
    };
  },

  toJSON(message: ProfileMethodWithConfig): unknown {
    const obj: any = {};
    message.profileMethod !== undefined && (obj.profileMethod = message.profileMethod ? ProfileMethod.toJSON(message.profileMethod) : undefined);
    message.periodSec !== undefined && (obj.periodSec = Math.round(message.periodSec));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ProfileMethodWithConfig>, I>>(object: I): ProfileMethodWithConfig {
    const message = createBaseProfileMethodWithConfig();
    message.profileMethod = object.profileMethod !== undefined && object.profileMethod !== null ? ProfileMethod.fromPartial(object.profileMethod) : undefined;
    message.periodSec = object.periodSec ?? 0;
    return message;
  },
};

function createBaseDeviceConfig(): DeviceConfig {
  return { profileMethods: [] };
}

export const DeviceConfig = {
  encode(message: DeviceConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.profileMethods) {
      ProfileMethodWithConfig.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeviceConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeviceConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.profileMethods.push(ProfileMethodWithConfig.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DeviceConfig {
    return {
      profileMethods: Array.isArray(object?.profileMethods) ? object.profileMethods.map((e: any) => ProfileMethodWithConfig.fromJSON(e)) : [],
    };
  },

  toJSON(message: DeviceConfig): unknown {
    const obj: any = {};
    if (message.profileMethods) {
      obj.profileMethods = message.profileMethods.map((e) => (e ? ProfileMethodWithConfig.toJSON(e) : undefined));
    } else {
      obj.profileMethods = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DeviceConfig>, I>>(object: I): DeviceConfig {
    const message = createBaseDeviceConfig();
    message.profileMethods = object.profileMethods?.map((e) => ProfileMethodWithConfig.fromPartial(e)) || [];
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
