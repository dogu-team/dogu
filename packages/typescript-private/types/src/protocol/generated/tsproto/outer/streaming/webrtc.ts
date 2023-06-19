/* eslint-disable */
import _m0 from 'protobufjs/minimal';

export enum ProtoRTCSdpType {
  PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED = 0,
  PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER = 1,
  PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER = 2,
  PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER = 3,
  PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK = 4,
  UNRECOGNIZED = -1,
}

export function protoRTCSdpTypeFromJSON(object: any): ProtoRTCSdpType {
  switch (object) {
    case 0:
    case 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED':
      return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED;
    case 1:
    case 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER':
      return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER;
    case 2:
    case 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER':
      return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER;
    case 3:
    case 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER':
      return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER;
    case 4:
    case 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK':
      return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return ProtoRTCSdpType.UNRECOGNIZED;
  }
}

export function protoRTCSdpTypeToJSON(object: ProtoRTCSdpType): string {
  switch (object) {
    case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED:
      return 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED';
    case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER:
      return 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER';
    case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER:
      return 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER';
    case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER:
      return 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER';
    case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK:
      return 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK';
    case ProtoRTCSdpType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED';
  }
}

export interface ProtoRTCPeerDescription {
  sdpBase64: string;
  type: ProtoRTCSdpType;
}

export interface ProtoRTCIceCandidateInit {
  candidate: string;
  sdpMlineIndex: number;
  sdpMid: string;
  usernameFragment: string;
}

function createBaseProtoRTCPeerDescription(): ProtoRTCPeerDescription {
  return { sdpBase64: '', type: 0 };
}

export const ProtoRTCPeerDescription = {
  encode(message: ProtoRTCPeerDescription, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sdpBase64 !== '') {
      writer.uint32(10).string(message.sdpBase64);
    }
    if (message.type !== 0) {
      writer.uint32(16).int32(message.type);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProtoRTCPeerDescription {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProtoRTCPeerDescription();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sdpBase64 = reader.string();
          break;
        case 2:
          message.type = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProtoRTCPeerDescription {
    return {
      sdpBase64: isSet(object.sdpBase64) ? String(object.sdpBase64) : '',
      type: isSet(object.type) ? protoRTCSdpTypeFromJSON(object.type) : 0,
    };
  },

  toJSON(message: ProtoRTCPeerDescription): unknown {
    const obj: any = {};
    message.sdpBase64 !== undefined && (obj.sdpBase64 = message.sdpBase64);
    message.type !== undefined && (obj.type = protoRTCSdpTypeToJSON(message.type));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ProtoRTCPeerDescription>, I>>(object: I): ProtoRTCPeerDescription {
    const message = createBaseProtoRTCPeerDescription();
    message.sdpBase64 = object.sdpBase64 ?? '';
    message.type = object.type ?? 0;
    return message;
  },
};

function createBaseProtoRTCIceCandidateInit(): ProtoRTCIceCandidateInit {
  return { candidate: '', sdpMlineIndex: 0, sdpMid: '', usernameFragment: '' };
}

export const ProtoRTCIceCandidateInit = {
  encode(message: ProtoRTCIceCandidateInit, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.candidate !== '') {
      writer.uint32(10).string(message.candidate);
    }
    if (message.sdpMlineIndex !== 0) {
      writer.uint32(16).int32(message.sdpMlineIndex);
    }
    if (message.sdpMid !== '') {
      writer.uint32(26).string(message.sdpMid);
    }
    if (message.usernameFragment !== '') {
      writer.uint32(34).string(message.usernameFragment);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProtoRTCIceCandidateInit {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProtoRTCIceCandidateInit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.candidate = reader.string();
          break;
        case 2:
          message.sdpMlineIndex = reader.int32();
          break;
        case 3:
          message.sdpMid = reader.string();
          break;
        case 4:
          message.usernameFragment = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ProtoRTCIceCandidateInit {
    return {
      candidate: isSet(object.candidate) ? String(object.candidate) : '',
      sdpMlineIndex: isSet(object.sdpMlineIndex) ? Number(object.sdpMlineIndex) : 0,
      sdpMid: isSet(object.sdpMid) ? String(object.sdpMid) : '',
      usernameFragment: isSet(object.usernameFragment) ? String(object.usernameFragment) : '',
    };
  },

  toJSON(message: ProtoRTCIceCandidateInit): unknown {
    const obj: any = {};
    message.candidate !== undefined && (obj.candidate = message.candidate);
    message.sdpMlineIndex !== undefined && (obj.sdpMlineIndex = Math.round(message.sdpMlineIndex));
    message.sdpMid !== undefined && (obj.sdpMid = message.sdpMid);
    message.usernameFragment !== undefined && (obj.usernameFragment = message.usernameFragment);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<ProtoRTCIceCandidateInit>, I>>(object: I): ProtoRTCIceCandidateInit {
    const message = createBaseProtoRTCIceCandidateInit();
    message.candidate = object.candidate ?? '';
    message.sdpMlineIndex = object.sdpMlineIndex ?? 0;
    message.sdpMid = object.sdpMid ?? '';
    message.usernameFragment = object.usernameFragment ?? '';
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
