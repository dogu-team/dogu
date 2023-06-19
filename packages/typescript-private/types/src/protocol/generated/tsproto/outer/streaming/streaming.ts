/* eslint-disable */
import _m0 from 'protobufjs/minimal';
import { ErrorResult } from '../errors';
import { Platform, platformFromJSON, platformToJSON } from '../platform';
import { ScreenCaptureOption } from './screencapture_option';
import { ProtoRTCIceCandidateInit, ProtoRTCPeerDescription } from './webrtc';

export interface StreamingOption {
  screen: ScreenCaptureOption | undefined;
}

export interface StartStreaming {
  peerDescription: ProtoRTCPeerDescription | undefined;
  option: StreamingOption | undefined;
  turnServerUrl: string;
  turnServerUsername: string;
  turnServerPassword: string;
  platform: Platform;
}

export interface StreamingOffer {
  serial: string;
  value?:
    | { $case: 'startStreaming'; startStreaming: StartStreaming }
    | {
        $case: 'iceCandidate';
        iceCandidate: ProtoRTCIceCandidateInit;
      };
}

export interface StreamingAnswer {
  value?:
    | { $case: 'peerDescription'; peerDescription: ProtoRTCPeerDescription }
    | {
        $case: 'iceCandidate';
        iceCandidate: ProtoRTCIceCandidateInit;
      }
    | { $case: 'errorResult'; errorResult: ErrorResult };
}

function createBaseStreamingOption(): StreamingOption {
  return { screen: undefined };
}

export const StreamingOption = {
  encode(message: StreamingOption, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.screen !== undefined) {
      ScreenCaptureOption.encode(message.screen, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StreamingOption {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStreamingOption();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.screen = ScreenCaptureOption.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StreamingOption {
    return { screen: isSet(object.screen) ? ScreenCaptureOption.fromJSON(object.screen) : undefined };
  },

  toJSON(message: StreamingOption): unknown {
    const obj: any = {};
    message.screen !== undefined && (obj.screen = message.screen ? ScreenCaptureOption.toJSON(message.screen) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<StreamingOption>, I>>(object: I): StreamingOption {
    const message = createBaseStreamingOption();
    message.screen = object.screen !== undefined && object.screen !== null ? ScreenCaptureOption.fromPartial(object.screen) : undefined;
    return message;
  },
};

function createBaseStartStreaming(): StartStreaming {
  return {
    peerDescription: undefined,
    option: undefined,
    turnServerUrl: '',
    turnServerUsername: '',
    turnServerPassword: '',
    platform: 0,
  };
}

export const StartStreaming = {
  encode(message: StartStreaming, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.peerDescription !== undefined) {
      ProtoRTCPeerDescription.encode(message.peerDescription, writer.uint32(10).fork()).ldelim();
    }
    if (message.option !== undefined) {
      StreamingOption.encode(message.option, writer.uint32(18).fork()).ldelim();
    }
    if (message.turnServerUrl !== '') {
      writer.uint32(26).string(message.turnServerUrl);
    }
    if (message.turnServerUsername !== '') {
      writer.uint32(34).string(message.turnServerUsername);
    }
    if (message.turnServerPassword !== '') {
      writer.uint32(42).string(message.turnServerPassword);
    }
    if (message.platform !== 0) {
      writer.uint32(48).int32(message.platform);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StartStreaming {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStartStreaming();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.peerDescription = ProtoRTCPeerDescription.decode(reader, reader.uint32());
          break;
        case 2:
          message.option = StreamingOption.decode(reader, reader.uint32());
          break;
        case 3:
          message.turnServerUrl = reader.string();
          break;
        case 4:
          message.turnServerUsername = reader.string();
          break;
        case 5:
          message.turnServerPassword = reader.string();
          break;
        case 6:
          message.platform = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StartStreaming {
    return {
      peerDescription: isSet(object.peerDescription) ? ProtoRTCPeerDescription.fromJSON(object.peerDescription) : undefined,
      option: isSet(object.option) ? StreamingOption.fromJSON(object.option) : undefined,
      turnServerUrl: isSet(object.turnServerUrl) ? String(object.turnServerUrl) : '',
      turnServerUsername: isSet(object.turnServerUsername) ? String(object.turnServerUsername) : '',
      turnServerPassword: isSet(object.turnServerPassword) ? String(object.turnServerPassword) : '',
      platform: isSet(object.platform) ? platformFromJSON(object.platform) : 0,
    };
  },

  toJSON(message: StartStreaming): unknown {
    const obj: any = {};
    message.peerDescription !== undefined && (obj.peerDescription = message.peerDescription ? ProtoRTCPeerDescription.toJSON(message.peerDescription) : undefined);
    message.option !== undefined && (obj.option = message.option ? StreamingOption.toJSON(message.option) : undefined);
    message.turnServerUrl !== undefined && (obj.turnServerUrl = message.turnServerUrl);
    message.turnServerUsername !== undefined && (obj.turnServerUsername = message.turnServerUsername);
    message.turnServerPassword !== undefined && (obj.turnServerPassword = message.turnServerPassword);
    message.platform !== undefined && (obj.platform = platformToJSON(message.platform));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<StartStreaming>, I>>(object: I): StartStreaming {
    const message = createBaseStartStreaming();
    message.peerDescription = object.peerDescription !== undefined && object.peerDescription !== null ? ProtoRTCPeerDescription.fromPartial(object.peerDescription) : undefined;
    message.option = object.option !== undefined && object.option !== null ? StreamingOption.fromPartial(object.option) : undefined;
    message.turnServerUrl = object.turnServerUrl ?? '';
    message.turnServerUsername = object.turnServerUsername ?? '';
    message.turnServerPassword = object.turnServerPassword ?? '';
    message.platform = object.platform ?? 0;
    return message;
  },
};

function createBaseStreamingOffer(): StreamingOffer {
  return { serial: '', value: undefined };
}

export const StreamingOffer = {
  encode(message: StreamingOffer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.serial !== '') {
      writer.uint32(10).string(message.serial);
    }
    if (message.value?.$case === 'startStreaming') {
      StartStreaming.encode(message.value.startStreaming, writer.uint32(18).fork()).ldelim();
    }
    if (message.value?.$case === 'iceCandidate') {
      ProtoRTCIceCandidateInit.encode(message.value.iceCandidate, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StreamingOffer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStreamingOffer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.serial = reader.string();
          break;
        case 2:
          message.value = { $case: 'startStreaming', startStreaming: StartStreaming.decode(reader, reader.uint32()) };
          break;
        case 3:
          message.value = {
            $case: 'iceCandidate',
            iceCandidate: ProtoRTCIceCandidateInit.decode(reader, reader.uint32()),
          };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StreamingOffer {
    return {
      serial: isSet(object.serial) ? String(object.serial) : '',
      value: isSet(object.startStreaming)
        ? { $case: 'startStreaming', startStreaming: StartStreaming.fromJSON(object.startStreaming) }
        : isSet(object.iceCandidate)
        ? { $case: 'iceCandidate', iceCandidate: ProtoRTCIceCandidateInit.fromJSON(object.iceCandidate) }
        : undefined,
    };
  },

  toJSON(message: StreamingOffer): unknown {
    const obj: any = {};
    message.serial !== undefined && (obj.serial = message.serial);
    message.value?.$case === 'startStreaming' && (obj.startStreaming = message.value?.startStreaming ? StartStreaming.toJSON(message.value?.startStreaming) : undefined);
    message.value?.$case === 'iceCandidate' && (obj.iceCandidate = message.value?.iceCandidate ? ProtoRTCIceCandidateInit.toJSON(message.value?.iceCandidate) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<StreamingOffer>, I>>(object: I): StreamingOffer {
    const message = createBaseStreamingOffer();
    message.serial = object.serial ?? '';
    if (object.value?.$case === 'startStreaming' && object.value?.startStreaming !== undefined && object.value?.startStreaming !== null) {
      message.value = {
        $case: 'startStreaming',
        startStreaming: StartStreaming.fromPartial(object.value.startStreaming),
      };
    }
    if (object.value?.$case === 'iceCandidate' && object.value?.iceCandidate !== undefined && object.value?.iceCandidate !== null) {
      message.value = {
        $case: 'iceCandidate',
        iceCandidate: ProtoRTCIceCandidateInit.fromPartial(object.value.iceCandidate),
      };
    }
    return message;
  },
};

function createBaseStreamingAnswer(): StreamingAnswer {
  return { value: undefined };
}

export const StreamingAnswer = {
  encode(message: StreamingAnswer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.value?.$case === 'peerDescription') {
      ProtoRTCPeerDescription.encode(message.value.peerDescription, writer.uint32(10).fork()).ldelim();
    }
    if (message.value?.$case === 'iceCandidate') {
      ProtoRTCIceCandidateInit.encode(message.value.iceCandidate, writer.uint32(18).fork()).ldelim();
    }
    if (message.value?.$case === 'errorResult') {
      ErrorResult.encode(message.value.errorResult, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StreamingAnswer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStreamingAnswer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = {
            $case: 'peerDescription',
            peerDescription: ProtoRTCPeerDescription.decode(reader, reader.uint32()),
          };
          break;
        case 2:
          message.value = {
            $case: 'iceCandidate',
            iceCandidate: ProtoRTCIceCandidateInit.decode(reader, reader.uint32()),
          };
          break;
        case 3:
          message.value = { $case: 'errorResult', errorResult: ErrorResult.decode(reader, reader.uint32()) };
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): StreamingAnswer {
    return {
      value: isSet(object.peerDescription)
        ? { $case: 'peerDescription', peerDescription: ProtoRTCPeerDescription.fromJSON(object.peerDescription) }
        : isSet(object.iceCandidate)
        ? { $case: 'iceCandidate', iceCandidate: ProtoRTCIceCandidateInit.fromJSON(object.iceCandidate) }
        : isSet(object.errorResult)
        ? { $case: 'errorResult', errorResult: ErrorResult.fromJSON(object.errorResult) }
        : undefined,
    };
  },

  toJSON(message: StreamingAnswer): unknown {
    const obj: any = {};
    message.value?.$case === 'peerDescription' &&
      (obj.peerDescription = message.value?.peerDescription ? ProtoRTCPeerDescription.toJSON(message.value?.peerDescription) : undefined);
    message.value?.$case === 'iceCandidate' && (obj.iceCandidate = message.value?.iceCandidate ? ProtoRTCIceCandidateInit.toJSON(message.value?.iceCandidate) : undefined);
    message.value?.$case === 'errorResult' && (obj.errorResult = message.value?.errorResult ? ErrorResult.toJSON(message.value?.errorResult) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<StreamingAnswer>, I>>(object: I): StreamingAnswer {
    const message = createBaseStreamingAnswer();
    if (object.value?.$case === 'peerDescription' && object.value?.peerDescription !== undefined && object.value?.peerDescription !== null) {
      message.value = {
        $case: 'peerDescription',
        peerDescription: ProtoRTCPeerDescription.fromPartial(object.value.peerDescription),
      };
    }
    if (object.value?.$case === 'iceCandidate' && object.value?.iceCandidate !== undefined && object.value?.iceCandidate !== null) {
      message.value = {
        $case: 'iceCandidate',
        iceCandidate: ProtoRTCIceCandidateInit.fromPartial(object.value.iceCandidate),
      };
    }
    if (object.value?.$case === 'errorResult' && object.value?.errorResult !== undefined && object.value?.errorResult !== null) {
      message.value = { $case: 'errorResult', errorResult: ErrorResult.fromPartial(object.value.errorResult) };
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
