import _m0 from 'protobufjs/minimal';
export declare enum ProtoRTCSdpType {
    PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED = 0,
    PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER = 1,
    PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER = 2,
    PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER = 3,
    PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK = 4,
    UNRECOGNIZED = -1
}
export declare function protoRTCSdpTypeFromJSON(object: any): ProtoRTCSdpType;
export declare function protoRTCSdpTypeToJSON(object: ProtoRTCSdpType): string;
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
export declare const ProtoRTCPeerDescription: {
    encode(message: ProtoRTCPeerDescription, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ProtoRTCPeerDescription;
    fromJSON(object: any): ProtoRTCPeerDescription;
    toJSON(message: ProtoRTCPeerDescription): unknown;
    fromPartial<I extends {
        sdpBase64?: string | undefined;
        type?: ProtoRTCSdpType | undefined;
    } & {
        sdpBase64?: string | undefined;
        type?: ProtoRTCSdpType | undefined;
    } & { [K in Exclude<keyof I, keyof ProtoRTCPeerDescription>]: never; }>(object: I): ProtoRTCPeerDescription;
};
export declare const ProtoRTCIceCandidateInit: {
    encode(message: ProtoRTCIceCandidateInit, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ProtoRTCIceCandidateInit;
    fromJSON(object: any): ProtoRTCIceCandidateInit;
    toJSON(message: ProtoRTCIceCandidateInit): unknown;
    fromPartial<I extends {
        candidate?: string | undefined;
        sdpMlineIndex?: number | undefined;
        sdpMid?: string | undefined;
        usernameFragment?: string | undefined;
    } & {
        candidate?: string | undefined;
        sdpMlineIndex?: number | undefined;
        sdpMid?: string | undefined;
        usernameFragment?: string | undefined;
    } & { [K in Exclude<keyof I, keyof ProtoRTCIceCandidateInit>]: never; }>(object: I): ProtoRTCIceCandidateInit;
};
