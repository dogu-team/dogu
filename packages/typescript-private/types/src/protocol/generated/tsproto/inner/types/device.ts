/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { Timestamp } from '../../google/protobuf/timestamp';
import { DeviceConnectionState, deviceConnectionStateFromJSON, deviceConnectionStateToJSON } from '../../outer/device_server';
import { Platform, platformFromJSON, platformToJSON } from '../../outer/platform';

export interface Device {
  deviceId: string;
  serial: string;
  name: string;
  platform: Platform;
  model: string;
  modelName?: string | undefined;
  version: string;
  isGlobal: number;
  isHost: number;
  isVirtual: number;
  connectionState: DeviceConnectionState;
  heartbeat: Date | undefined;
  /** relations */
  organizationId: string;
  hostId: string;
  /** timestamps */
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  manufacturer: string;
  resolutionWidth: number;
  resolutionHeight: number;
}

function createBaseDevice(): Device {
  return {
    deviceId: '',
    serial: '',
    name: '',
    platform: 0,
    model: '',
    modelName: undefined,
    version: '',
    isGlobal: 0,
    isHost: 0,
    isVirtual: 0,
    connectionState: 0,
    heartbeat: undefined,
    organizationId: '',
    hostId: '',
    createdAt: undefined,
    updatedAt: undefined,
    manufacturer: '',
    resolutionWidth: 0,
    resolutionHeight: 0,
  };
}

export const Device = {
  encode(message: Device, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.deviceId !== '') {
      writer.uint32(10).string(message.deviceId);
    }
    if (message.serial !== '') {
      writer.uint32(18).string(message.serial);
    }
    if (message.name !== '') {
      writer.uint32(26).string(message.name);
    }
    if (message.platform !== 0) {
      writer.uint32(32).int32(message.platform);
    }
    if (message.model !== '') {
      writer.uint32(42).string(message.model);
    }
    if (message.modelName !== undefined) {
      writer.uint32(50).string(message.modelName);
    }
    if (message.version !== '') {
      writer.uint32(58).string(message.version);
    }
    if (message.isGlobal !== 0) {
      writer.uint32(69).sfixed32(message.isGlobal);
    }
    if (message.isHost !== 0) {
      writer.uint32(77).sfixed32(message.isHost);
    }
    if (message.isVirtual !== 0) {
      writer.uint32(157).sfixed32(message.isVirtual);
    }
    if (message.connectionState !== 0) {
      writer.uint32(80).int32(message.connectionState);
    }
    if (message.heartbeat !== undefined) {
      Timestamp.encode(toTimestamp(message.heartbeat), writer.uint32(90).fork()).ldelim();
    }
    if (message.organizationId !== '') {
      writer.uint32(98).string(message.organizationId);
    }
    if (message.hostId !== '') {
      writer.uint32(106).string(message.hostId);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(toTimestamp(message.createdAt), writer.uint32(114).fork()).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.updatedAt), writer.uint32(122).fork()).ldelim();
    }
    if (message.manufacturer !== '') {
      writer.uint32(130).string(message.manufacturer);
    }
    if (message.resolutionWidth !== 0) {
      writer.uint32(141).fixed32(message.resolutionWidth);
    }
    if (message.resolutionHeight !== 0) {
      writer.uint32(149).fixed32(message.resolutionHeight);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Device {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDevice();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.deviceId = reader.string();
          break;
        case 2:
          message.serial = reader.string();
          break;
        case 3:
          message.name = reader.string();
          break;
        case 4:
          message.platform = reader.int32() as any;
          break;
        case 5:
          message.model = reader.string();
          break;
        case 6:
          message.modelName = reader.string();
          break;
        case 7:
          message.version = reader.string();
          break;
        case 8:
          message.isGlobal = reader.sfixed32();
          break;
        case 9:
          message.isHost = reader.sfixed32();
          break;
        case 19:
          message.isVirtual = reader.sfixed32();
          break;
        case 10:
          message.connectionState = reader.int32() as any;
          break;
        case 11:
          message.heartbeat = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 12:
          message.organizationId = reader.string();
          break;
        case 13:
          message.hostId = reader.string();
          break;
        case 14:
          message.createdAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 15:
          message.updatedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 16:
          message.manufacturer = reader.string();
          break;
        case 17:
          message.resolutionWidth = reader.fixed32();
          break;
        case 18:
          message.resolutionHeight = reader.fixed32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Device {
    return {
      deviceId: isSet(object.deviceId) ? String(object.deviceId) : '',
      serial: isSet(object.serial) ? String(object.serial) : '',
      name: isSet(object.name) ? String(object.name) : '',
      platform: isSet(object.platform) ? platformFromJSON(object.platform) : 0,
      model: isSet(object.model) ? String(object.model) : '',
      modelName: isSet(object.modelName) ? String(object.modelName) : undefined,
      version: isSet(object.version) ? String(object.version) : '',
      isGlobal: isSet(object.isGlobal) ? Number(object.isGlobal) : 0,
      isHost: isSet(object.isHost) ? Number(object.isHost) : 0,
      isVirtual: isSet(object.isVirtual) ? Number(object.isVirtual) : 0,
      connectionState: isSet(object.connectionState) ? deviceConnectionStateFromJSON(object.connectionState) : 0,
      heartbeat: isSet(object.heartbeat) ? fromJsonTimestamp(object.heartbeat) : undefined,
      organizationId: isSet(object.organizationId) ? String(object.organizationId) : '',
      hostId: isSet(object.hostId) ? String(object.hostId) : '',
      createdAt: isSet(object.createdAt) ? fromJsonTimestamp(object.createdAt) : undefined,
      updatedAt: isSet(object.updatedAt) ? fromJsonTimestamp(object.updatedAt) : undefined,
      manufacturer: isSet(object.manufacturer) ? String(object.manufacturer) : '',
      resolutionWidth: isSet(object.resolutionWidth) ? Number(object.resolutionWidth) : 0,
      resolutionHeight: isSet(object.resolutionHeight) ? Number(object.resolutionHeight) : 0,
    };
  },

  toJSON(message: Device): unknown {
    const obj: any = {};
    message.deviceId !== undefined && (obj.deviceId = message.deviceId);
    message.serial !== undefined && (obj.serial = message.serial);
    message.name !== undefined && (obj.name = message.name);
    message.platform !== undefined && (obj.platform = platformToJSON(message.platform));
    message.model !== undefined && (obj.model = message.model);
    message.modelName !== undefined && (obj.modelName = message.modelName);
    message.version !== undefined && (obj.version = message.version);
    message.isGlobal !== undefined && (obj.isGlobal = Math.round(message.isGlobal));
    message.isHost !== undefined && (obj.isHost = Math.round(message.isHost));
    message.isVirtual !== undefined && (obj.isVirtual = Math.round(message.isVirtual));
    message.connectionState !== undefined && (obj.connectionState = deviceConnectionStateToJSON(message.connectionState));
    message.heartbeat !== undefined && (obj.heartbeat = message.heartbeat.toISOString());
    message.organizationId !== undefined && (obj.organizationId = message.organizationId);
    message.hostId !== undefined && (obj.hostId = message.hostId);
    message.createdAt !== undefined && (obj.createdAt = message.createdAt.toISOString());
    message.updatedAt !== undefined && (obj.updatedAt = message.updatedAt.toISOString());
    message.manufacturer !== undefined && (obj.manufacturer = message.manufacturer);
    message.resolutionWidth !== undefined && (obj.resolutionWidth = Math.round(message.resolutionWidth));
    message.resolutionHeight !== undefined && (obj.resolutionHeight = Math.round(message.resolutionHeight));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Device>, I>>(object: I): Device {
    const message = createBaseDevice();
    message.deviceId = object.deviceId ?? '';
    message.serial = object.serial ?? '';
    message.name = object.name ?? '';
    message.platform = object.platform ?? 0;
    message.model = object.model ?? '';
    message.modelName = object.modelName ?? undefined;
    message.version = object.version ?? '';
    message.isGlobal = object.isGlobal ?? 0;
    message.isHost = object.isHost ?? 0;
    message.isVirtual = object.isVirtual ?? 0;
    message.connectionState = object.connectionState ?? 0;
    message.heartbeat = object.heartbeat ?? undefined;
    message.organizationId = object.organizationId ?? '';
    message.hostId = object.hostId ?? '';
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.manufacturer = object.manufacturer ?? '';
    message.resolutionWidth = object.resolutionWidth ?? 0;
    message.resolutionHeight = object.resolutionHeight ?? 0;
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
