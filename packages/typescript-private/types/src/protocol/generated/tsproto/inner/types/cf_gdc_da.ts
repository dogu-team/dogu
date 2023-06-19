/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { ErrorResult } from '../../outer/errors';
import { WebSocketConnection } from '../../outer/http_ws';
import { DeviceControl } from './device_control';

export interface DataChannelProtocolDefault {}

export interface DataChannelProtocolRelayTcp {
  port: number;
}

export interface DataChannelProtocolDeviceHttp {}

export interface DataChannelProtocolDeviceWebSocket {
  connection: WebSocketConnection | undefined;
}

export interface DataChannelLabel {
  name: string;
  protocol?:
    | { $case: 'default'; default: DataChannelProtocolDefault }
    | { $case: 'relayTcp'; relayTcp: DataChannelProtocolRelayTcp }
    | { $case: 'deviceHttp'; deviceHttp: DataChannelProtocolDeviceHttp }
    | { $case: 'deviceWebSocket'; deviceWebSocket: DataChannelProtocolDeviceWebSocket };
}

export interface CfGdcDaControlParam {
  control: DeviceControl | undefined;
}

export interface CfGdcDaControlResult {
  error: ErrorResult | undefined;
}

function createBaseDataChannelProtocolDefault(): DataChannelProtocolDefault {
  return {};
}

export const DataChannelProtocolDefault = {
  encode(_: DataChannelProtocolDefault, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DataChannelProtocolDefault {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDataChannelProtocolDefault();
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

  fromJSON(_: any): DataChannelProtocolDefault {
    return {};
  },

  toJSON(_: DataChannelProtocolDefault): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DataChannelProtocolDefault>, I>>(_: I): DataChannelProtocolDefault {
    const message = createBaseDataChannelProtocolDefault();
    return message;
  },
};

function createBaseDataChannelProtocolRelayTcp(): DataChannelProtocolRelayTcp {
  return { port: 0 };
}

export const DataChannelProtocolRelayTcp = {
  encode(message: DataChannelProtocolRelayTcp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.port !== 0) {
      writer.uint32(8).uint32(message.port);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DataChannelProtocolRelayTcp {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDataChannelProtocolRelayTcp();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.port = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DataChannelProtocolRelayTcp {
    return { port: isSet(object.port) ? Number(object.port) : 0 };
  },

  toJSON(message: DataChannelProtocolRelayTcp): unknown {
    const obj: any = {};
    message.port !== undefined && (obj.port = Math.round(message.port));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DataChannelProtocolRelayTcp>, I>>(object: I): DataChannelProtocolRelayTcp {
    const message = createBaseDataChannelProtocolRelayTcp();
    message.port = object.port ?? 0;
    return message;
  },
};

function createBaseDataChannelProtocolDeviceHttp(): DataChannelProtocolDeviceHttp {
  return {};
}

export const DataChannelProtocolDeviceHttp = {
  encode(_: DataChannelProtocolDeviceHttp, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DataChannelProtocolDeviceHttp {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDataChannelProtocolDeviceHttp();
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

  fromJSON(_: any): DataChannelProtocolDeviceHttp {
    return {};
  },

  toJSON(_: DataChannelProtocolDeviceHttp): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DataChannelProtocolDeviceHttp>, I>>(_: I): DataChannelProtocolDeviceHttp {
    const message = createBaseDataChannelProtocolDeviceHttp();
    return message;
  },
};

function createBaseDataChannelProtocolDeviceWebSocket(): DataChannelProtocolDeviceWebSocket {
  return { connection: undefined };
}

export const DataChannelProtocolDeviceWebSocket = {
  encode(message: DataChannelProtocolDeviceWebSocket, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.connection !== undefined) {
      WebSocketConnection.encode(message.connection, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DataChannelProtocolDeviceWebSocket {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDataChannelProtocolDeviceWebSocket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connection = WebSocketConnection.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DataChannelProtocolDeviceWebSocket {
    return { connection: isSet(object.connection) ? WebSocketConnection.fromJSON(object.connection) : undefined };
  },

  toJSON(message: DataChannelProtocolDeviceWebSocket): unknown {
    const obj: any = {};
    message.connection !== undefined && (obj.connection = message.connection ? WebSocketConnection.toJSON(message.connection) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DataChannelProtocolDeviceWebSocket>, I>>(object: I): DataChannelProtocolDeviceWebSocket {
    const message = createBaseDataChannelProtocolDeviceWebSocket();
    message.connection = object.connection !== undefined && object.connection !== null ? WebSocketConnection.fromPartial(object.connection) : undefined;
    return message;
  },
};

function createBaseDataChannelLabel(): DataChannelLabel {
  return { name: '', protocol: undefined };
}

export const DataChannelLabel = {
  encode(message: DataChannelLabel, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== '') {
      writer.uint32(10).string(message.name);
    }
    if (message.protocol?.$case === 'default') {
      DataChannelProtocolDefault.encode(message.protocol.default, writer.uint32(18).fork()).ldelim();
    }
    if (message.protocol?.$case === 'relayTcp') {
      DataChannelProtocolRelayTcp.encode(message.protocol.relayTcp, writer.uint32(26).fork()).ldelim();
    }
    if (message.protocol?.$case === 'deviceHttp') {
      DataChannelProtocolDeviceHttp.encode(message.protocol.deviceHttp, writer.uint32(34).fork()).ldelim();
    }
    if (message.protocol?.$case === 'deviceWebSocket') {
      DataChannelProtocolDeviceWebSocket.encode(message.protocol.deviceWebSocket, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DataChannelLabel {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDataChannelLabel();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.protocol = { $case: 'default', default: DataChannelProtocolDefault.decode(reader, reader.uint32()) };
          break;
        case 3:
          message.protocol = {
            $case: 'relayTcp',
            relayTcp: DataChannelProtocolRelayTcp.decode(reader, reader.uint32()),
          };
          break;
        case 4:
          message.protocol = {
            $case: 'deviceHttp',
            deviceHttp: DataChannelProtocolDeviceHttp.decode(reader, reader.uint32()),
          };
          break;
        case 5:
          message.protocol = {
            $case: 'deviceWebSocket',
            deviceWebSocket: DataChannelProtocolDeviceWebSocket.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DataChannelLabel {
    return {
      name: isSet(object.name) ? String(object.name) : '',
      protocol: isSet(object.default)
        ? { $case: 'default', default: DataChannelProtocolDefault.fromJSON(object.default) }
        : isSet(object.relayTcp)
        ? { $case: 'relayTcp', relayTcp: DataChannelProtocolRelayTcp.fromJSON(object.relayTcp) }
        : isSet(object.deviceHttp)
        ? { $case: 'deviceHttp', deviceHttp: DataChannelProtocolDeviceHttp.fromJSON(object.deviceHttp) }
        : isSet(object.deviceWebSocket)
        ? {
            $case: 'deviceWebSocket',
            deviceWebSocket: DataChannelProtocolDeviceWebSocket.fromJSON(object.deviceWebSocket),
          }
        : undefined,
    };
  },

  toJSON(message: DataChannelLabel): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.protocol?.$case === 'default' && (obj.default = message.protocol?.default ? DataChannelProtocolDefault.toJSON(message.protocol?.default) : undefined);
    message.protocol?.$case === 'relayTcp' && (obj.relayTcp = message.protocol?.relayTcp ? DataChannelProtocolRelayTcp.toJSON(message.protocol?.relayTcp) : undefined);
    message.protocol?.$case === 'deviceHttp' && (obj.deviceHttp = message.protocol?.deviceHttp ? DataChannelProtocolDeviceHttp.toJSON(message.protocol?.deviceHttp) : undefined);
    message.protocol?.$case === 'deviceWebSocket' &&
      (obj.deviceWebSocket = message.protocol?.deviceWebSocket ? DataChannelProtocolDeviceWebSocket.toJSON(message.protocol?.deviceWebSocket) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DataChannelLabel>, I>>(object: I): DataChannelLabel {
    const message = createBaseDataChannelLabel();
    message.name = object.name ?? '';
    if (object.protocol?.$case === 'default' && object.protocol?.default !== undefined && object.protocol?.default !== null) {
      message.protocol = { $case: 'default', default: DataChannelProtocolDefault.fromPartial(object.protocol.default) };
    }
    if (object.protocol?.$case === 'relayTcp' && object.protocol?.relayTcp !== undefined && object.protocol?.relayTcp !== null) {
      message.protocol = {
        $case: 'relayTcp',
        relayTcp: DataChannelProtocolRelayTcp.fromPartial(object.protocol.relayTcp),
      };
    }
    if (object.protocol?.$case === 'deviceHttp' && object.protocol?.deviceHttp !== undefined && object.protocol?.deviceHttp !== null) {
      message.protocol = {
        $case: 'deviceHttp',
        deviceHttp: DataChannelProtocolDeviceHttp.fromPartial(object.protocol.deviceHttp),
      };
    }
    if (object.protocol?.$case === 'deviceWebSocket' && object.protocol?.deviceWebSocket !== undefined && object.protocol?.deviceWebSocket !== null) {
      message.protocol = {
        $case: 'deviceWebSocket',
        deviceWebSocket: DataChannelProtocolDeviceWebSocket.fromPartial(object.protocol.deviceWebSocket),
      };
    }
    return message;
  },
};

function createBaseCfGdcDaControlParam(): CfGdcDaControlParam {
  return { control: undefined };
}

export const CfGdcDaControlParam = {
  encode(message: CfGdcDaControlParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.control !== undefined) {
      DeviceControl.encode(message.control, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CfGdcDaControlParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCfGdcDaControlParam();
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

  fromJSON(object: any): CfGdcDaControlParam {
    return { control: isSet(object.control) ? DeviceControl.fromJSON(object.control) : undefined };
  },

  toJSON(message: CfGdcDaControlParam): unknown {
    const obj: any = {};
    message.control !== undefined && (obj.control = message.control ? DeviceControl.toJSON(message.control) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CfGdcDaControlParam>, I>>(object: I): CfGdcDaControlParam {
    const message = createBaseCfGdcDaControlParam();
    message.control = object.control !== undefined && object.control !== null ? DeviceControl.fromPartial(object.control) : undefined;
    return message;
  },
};

function createBaseCfGdcDaControlResult(): CfGdcDaControlResult {
  return { error: undefined };
}

export const CfGdcDaControlResult = {
  encode(message: CfGdcDaControlResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error !== undefined) {
      ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CfGdcDaControlResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCfGdcDaControlResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.error = ErrorResult.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CfGdcDaControlResult {
    return { error: isSet(object.error) ? ErrorResult.fromJSON(object.error) : undefined };
  },

  toJSON(message: CfGdcDaControlResult): unknown {
    const obj: any = {};
    message.error !== undefined && (obj.error = message.error ? ErrorResult.toJSON(message.error) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<CfGdcDaControlResult>, I>>(object: I): CfGdcDaControlResult {
    const message = createBaseCfGdcDaControlResult();
    message.error = object.error !== undefined && object.error !== null ? ErrorResult.fromPartial(object.error) : undefined;
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
