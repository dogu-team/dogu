import { ProtoRTCPeerDescription, ProtoRTCSdpType } from '@dogu-private/types';

export function convertSdpFromTsToProto(ts: RTCSessionDescription): ProtoRTCPeerDescription {
  const sdbBase64 = btoa(ts.sdp);
  const type = convertSdpTypeFromTsToProto(ts.type);
  return { sdpBase64: sdbBase64, type };
}
export function convertSdpFromProtoToTs(proto: ProtoRTCPeerDescription): RTCSessionDescription {
  const sdp = atob(proto.sdpBase64);
  const type = convertSdpTypeFromProtoToTs(proto.type);
  return { ...proto, sdp: sdp, type: type, toJSON: () => ({ sdp: sdp, type: type }) };
}

export function convertSdpTypeFromProtoToTs(proto: ProtoRTCSdpType): RTCSdpType {
  switch (proto) {
    case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER:
      return 'offer';
    case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER:
      return 'answer';
    case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER:
      return 'pranswer';
    case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK:
      return 'rollback';
    default:
      throw new Error(`Unknown ProtoRTCSdpType: ${proto}`);
  }
}

export function convertSdpTypeFromTsToProto(ts: RTCSdpType): ProtoRTCSdpType {
  switch (ts) {
    case 'offer':
      return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER;
    case 'answer':
      return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER;
    case 'pranswer':
      return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER;
    case 'rollback':
      return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK;
    default:
      throw new Error('Unknown RTCSdpType');
  }
}
