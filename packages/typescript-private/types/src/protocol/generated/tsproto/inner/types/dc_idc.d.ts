import _m0 from 'protobufjs/minimal';
import { ErrorResult } from '../../outer/errors';
import { ScreenRecordOption } from '../../outer/streaming/screenrecord_option';
import { StreamingAnswer, StreamingOffer } from '../../outer/streaming/streaming';
export interface DcIdcStartStreamingParam {
    offer: StreamingOffer | undefined;
}
export interface DcIdcStartStreamingResult {
    answer: StreamingAnswer | undefined;
}
export interface DcIdcScanIdsParam {
}
export interface DcIdcScanIdsResult {
    ids: string[];
}
export interface DcIdcOpenGrpcClientParam {
    serial: string;
    grpcHost: string;
    grpcPort: number;
}
export interface DcIdcOpenGrpcClientResult {
}
export interface DcIdcCheckGrpcHealthParam {
    serial: string;
}
export interface DcIdcCheckGrpcHealthResult {
}
export interface DcIdcStartScreenRecordParam {
    serial: string;
    option: ScreenRecordOption | undefined;
}
export interface DcIdcStartScreenRecordResult {
    error: ErrorResult | undefined;
}
export interface DcIdcStopScreenRecordParam {
    serial: string;
}
export interface DcIdcStopScreenRecordResult {
    error: ErrorResult | undefined;
    filePath: string;
}
export declare const DcIdcStartStreamingParam: {
    encode(message: DcIdcStartStreamingParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcStartStreamingParam;
    fromJSON(object: any): DcIdcStartStreamingParam;
    toJSON(message: DcIdcStartStreamingParam): unknown;
    fromPartial<I extends {
        offer?: {
            serial?: string | undefined;
            value?: ({
                startStreaming?: {
                    peerDescription?: {
                        sdpBase64?: string | undefined;
                        type?: import("../../index").ProtoRTCSdpType | undefined;
                    } | undefined;
                    option?: {
                        screen?: {
                            bitRate?: number | undefined;
                            maxFps?: number | undefined;
                            frameRate?: number | undefined;
                            frameInterval?: number | undefined;
                            repeatFrameDelay?: number | undefined;
                            maxResolution?: number | undefined;
                            screenId?: number | undefined;
                            pid?: number | undefined;
                        } | undefined;
                    } | undefined;
                    turnServerUrl?: string | undefined;
                    turnServerUsername?: string | undefined;
                    turnServerPassword?: string | undefined;
                    platform?: import("../../index").Platform | undefined;
                } | undefined;
            } & {
                $case: "startStreaming";
            }) | ({
                iceCandidate?: {
                    candidate?: string | undefined;
                    sdpMlineIndex?: number | undefined;
                    sdpMid?: string | undefined;
                    usernameFragment?: string | undefined;
                } | undefined;
            } & {
                $case: "iceCandidate";
            }) | undefined;
        } | undefined;
    } & {
        offer?: ({
            serial?: string | undefined;
            value?: ({
                startStreaming?: {
                    peerDescription?: {
                        sdpBase64?: string | undefined;
                        type?: import("../../index").ProtoRTCSdpType | undefined;
                    } | undefined;
                    option?: {
                        screen?: {
                            bitRate?: number | undefined;
                            maxFps?: number | undefined;
                            frameRate?: number | undefined;
                            frameInterval?: number | undefined;
                            repeatFrameDelay?: number | undefined;
                            maxResolution?: number | undefined;
                            screenId?: number | undefined;
                            pid?: number | undefined;
                        } | undefined;
                    } | undefined;
                    turnServerUrl?: string | undefined;
                    turnServerUsername?: string | undefined;
                    turnServerPassword?: string | undefined;
                    platform?: import("../../index").Platform | undefined;
                } | undefined;
            } & {
                $case: "startStreaming";
            }) | ({
                iceCandidate?: {
                    candidate?: string | undefined;
                    sdpMlineIndex?: number | undefined;
                    sdpMid?: string | undefined;
                    usernameFragment?: string | undefined;
                } | undefined;
            } & {
                $case: "iceCandidate";
            }) | undefined;
        } & {
            serial?: string | undefined;
            value?: ({
                startStreaming?: {
                    peerDescription?: {
                        sdpBase64?: string | undefined;
                        type?: import("../../index").ProtoRTCSdpType | undefined;
                    } | undefined;
                    option?: {
                        screen?: {
                            bitRate?: number | undefined;
                            maxFps?: number | undefined;
                            frameRate?: number | undefined;
                            frameInterval?: number | undefined;
                            repeatFrameDelay?: number | undefined;
                            maxResolution?: number | undefined;
                            screenId?: number | undefined;
                            pid?: number | undefined;
                        } | undefined;
                    } | undefined;
                    turnServerUrl?: string | undefined;
                    turnServerUsername?: string | undefined;
                    turnServerPassword?: string | undefined;
                    platform?: import("../../index").Platform | undefined;
                } | undefined;
            } & {
                $case: "startStreaming";
            } & {
                startStreaming?: ({
                    peerDescription?: {
                        sdpBase64?: string | undefined;
                        type?: import("../../index").ProtoRTCSdpType | undefined;
                    } | undefined;
                    option?: {
                        screen?: {
                            bitRate?: number | undefined;
                            maxFps?: number | undefined;
                            frameRate?: number | undefined;
                            frameInterval?: number | undefined;
                            repeatFrameDelay?: number | undefined;
                            maxResolution?: number | undefined;
                            screenId?: number | undefined;
                            pid?: number | undefined;
                        } | undefined;
                    } | undefined;
                    turnServerUrl?: string | undefined;
                    turnServerUsername?: string | undefined;
                    turnServerPassword?: string | undefined;
                    platform?: import("../../index").Platform | undefined;
                } & {
                    peerDescription?: ({
                        sdpBase64?: string | undefined;
                        type?: import("../../index").ProtoRTCSdpType | undefined;
                    } & {
                        sdpBase64?: string | undefined;
                        type?: import("../../index").ProtoRTCSdpType | undefined;
                    } & { [K in Exclude<keyof I["offer"]["value"]["startStreaming"]["peerDescription"], keyof import("../../index").ProtoRTCPeerDescription>]: never; }) | undefined;
                    option?: ({
                        screen?: {
                            bitRate?: number | undefined;
                            maxFps?: number | undefined;
                            frameRate?: number | undefined;
                            frameInterval?: number | undefined;
                            repeatFrameDelay?: number | undefined;
                            maxResolution?: number | undefined;
                            screenId?: number | undefined;
                            pid?: number | undefined;
                        } | undefined;
                    } & {
                        screen?: ({
                            bitRate?: number | undefined;
                            maxFps?: number | undefined;
                            frameRate?: number | undefined;
                            frameInterval?: number | undefined;
                            repeatFrameDelay?: number | undefined;
                            maxResolution?: number | undefined;
                            screenId?: number | undefined;
                            pid?: number | undefined;
                        } & {
                            bitRate?: number | undefined;
                            maxFps?: number | undefined;
                            frameRate?: number | undefined;
                            frameInterval?: number | undefined;
                            repeatFrameDelay?: number | undefined;
                            maxResolution?: number | undefined;
                            screenId?: number | undefined;
                            pid?: number | undefined;
                        } & { [K_1 in Exclude<keyof I["offer"]["value"]["startStreaming"]["option"]["screen"], keyof import("../../index").ScreenCaptureOption>]: never; }) | undefined;
                    } & { [K_2 in Exclude<keyof I["offer"]["value"]["startStreaming"]["option"], "screen">]: never; }) | undefined;
                    turnServerUrl?: string | undefined;
                    turnServerUsername?: string | undefined;
                    turnServerPassword?: string | undefined;
                    platform?: import("../../index").Platform | undefined;
                } & { [K_3 in Exclude<keyof I["offer"]["value"]["startStreaming"], keyof import("../../outer/streaming/streaming").StartStreaming>]: never; }) | undefined;
                $case: "startStreaming";
            } & { [K_4 in Exclude<keyof I["offer"]["value"], "$case" | "startStreaming">]: never; }) | ({
                iceCandidate?: {
                    candidate?: string | undefined;
                    sdpMlineIndex?: number | undefined;
                    sdpMid?: string | undefined;
                    usernameFragment?: string | undefined;
                } | undefined;
            } & {
                $case: "iceCandidate";
            } & {
                iceCandidate?: ({
                    candidate?: string | undefined;
                    sdpMlineIndex?: number | undefined;
                    sdpMid?: string | undefined;
                    usernameFragment?: string | undefined;
                } & {
                    candidate?: string | undefined;
                    sdpMlineIndex?: number | undefined;
                    sdpMid?: string | undefined;
                    usernameFragment?: string | undefined;
                } & { [K_5 in Exclude<keyof I["offer"]["value"]["iceCandidate"], keyof import("../../index").ProtoRTCIceCandidateInit>]: never; }) | undefined;
                $case: "iceCandidate";
            } & { [K_6 in Exclude<keyof I["offer"]["value"], "$case" | "iceCandidate">]: never; }) | undefined;
        } & { [K_7 in Exclude<keyof I["offer"], keyof StreamingOffer>]: never; }) | undefined;
    } & { [K_8 in Exclude<keyof I, "offer">]: never; }>(object: I): DcIdcStartStreamingParam;
};
export declare const DcIdcStartStreamingResult: {
    encode(message: DcIdcStartStreamingResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcStartStreamingResult;
    fromJSON(object: any): DcIdcStartStreamingResult;
    toJSON(message: DcIdcStartStreamingResult): unknown;
    fromPartial<I extends {
        answer?: {
            value?: ({
                peerDescription?: {
                    sdpBase64?: string | undefined;
                    type?: import("../../index").ProtoRTCSdpType | undefined;
                } | undefined;
            } & {
                $case: "peerDescription";
            }) | ({
                iceCandidate?: {
                    candidate?: string | undefined;
                    sdpMlineIndex?: number | undefined;
                    sdpMid?: string | undefined;
                    usernameFragment?: string | undefined;
                } | undefined;
            } & {
                $case: "iceCandidate";
            }) | ({
                errorResult?: {
                    code?: import("../../outer/errors").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } & {
                $case: "errorResult";
            }) | undefined;
        } | undefined;
    } & {
        answer?: ({
            value?: ({
                peerDescription?: {
                    sdpBase64?: string | undefined;
                    type?: import("../../index").ProtoRTCSdpType | undefined;
                } | undefined;
            } & {
                $case: "peerDescription";
            }) | ({
                iceCandidate?: {
                    candidate?: string | undefined;
                    sdpMlineIndex?: number | undefined;
                    sdpMid?: string | undefined;
                    usernameFragment?: string | undefined;
                } | undefined;
            } & {
                $case: "iceCandidate";
            }) | ({
                errorResult?: {
                    code?: import("../../outer/errors").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } & {
                $case: "errorResult";
            }) | undefined;
        } & {
            value?: ({
                peerDescription?: {
                    sdpBase64?: string | undefined;
                    type?: import("../../index").ProtoRTCSdpType | undefined;
                } | undefined;
            } & {
                $case: "peerDescription";
            } & {
                peerDescription?: ({
                    sdpBase64?: string | undefined;
                    type?: import("../../index").ProtoRTCSdpType | undefined;
                } & {
                    sdpBase64?: string | undefined;
                    type?: import("../../index").ProtoRTCSdpType | undefined;
                } & { [K in Exclude<keyof I["answer"]["value"]["peerDescription"], keyof import("../../index").ProtoRTCPeerDescription>]: never; }) | undefined;
                $case: "peerDescription";
            } & { [K_1 in Exclude<keyof I["answer"]["value"], "$case" | "peerDescription">]: never; }) | ({
                iceCandidate?: {
                    candidate?: string | undefined;
                    sdpMlineIndex?: number | undefined;
                    sdpMid?: string | undefined;
                    usernameFragment?: string | undefined;
                } | undefined;
            } & {
                $case: "iceCandidate";
            } & {
                iceCandidate?: ({
                    candidate?: string | undefined;
                    sdpMlineIndex?: number | undefined;
                    sdpMid?: string | undefined;
                    usernameFragment?: string | undefined;
                } & {
                    candidate?: string | undefined;
                    sdpMlineIndex?: number | undefined;
                    sdpMid?: string | undefined;
                    usernameFragment?: string | undefined;
                } & { [K_2 in Exclude<keyof I["answer"]["value"]["iceCandidate"], keyof import("../../index").ProtoRTCIceCandidateInit>]: never; }) | undefined;
                $case: "iceCandidate";
            } & { [K_3 in Exclude<keyof I["answer"]["value"], "$case" | "iceCandidate">]: never; }) | ({
                errorResult?: {
                    code?: import("../../outer/errors").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } & {
                $case: "errorResult";
            } & {
                errorResult?: ({
                    code?: import("../../outer/errors").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } & {
                    code?: import("../../outer/errors").Code | undefined;
                    message?: string | undefined;
                    details?: ({
                        [x: string]: any;
                    } & {
                        [x: string]: any;
                    } & { [K_4 in Exclude<keyof I["answer"]["value"]["errorResult"]["details"], string | number>]: never; }) | undefined;
                } & { [K_5 in Exclude<keyof I["answer"]["value"]["errorResult"], keyof ErrorResult>]: never; }) | undefined;
                $case: "errorResult";
            } & { [K_6 in Exclude<keyof I["answer"]["value"], "$case" | "errorResult">]: never; }) | undefined;
        } & { [K_7 in Exclude<keyof I["answer"], "value">]: never; }) | undefined;
    } & { [K_8 in Exclude<keyof I, "answer">]: never; }>(object: I): DcIdcStartStreamingResult;
};
export declare const DcIdcScanIdsParam: {
    encode(_: DcIdcScanIdsParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcScanIdsParam;
    fromJSON(_: any): DcIdcScanIdsParam;
    toJSON(_: DcIdcScanIdsParam): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DcIdcScanIdsParam;
};
export declare const DcIdcScanIdsResult: {
    encode(message: DcIdcScanIdsResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcScanIdsResult;
    fromJSON(object: any): DcIdcScanIdsResult;
    toJSON(message: DcIdcScanIdsResult): unknown;
    fromPartial<I extends {
        ids?: string[] | undefined;
    } & {
        ids?: (string[] & string[] & { [K in Exclude<keyof I["ids"], keyof string[]>]: never; }) | undefined;
    } & { [K_1 in Exclude<keyof I, "ids">]: never; }>(object: I): DcIdcScanIdsResult;
};
export declare const DcIdcOpenGrpcClientParam: {
    encode(message: DcIdcOpenGrpcClientParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcOpenGrpcClientParam;
    fromJSON(object: any): DcIdcOpenGrpcClientParam;
    toJSON(message: DcIdcOpenGrpcClientParam): unknown;
    fromPartial<I extends {
        serial?: string | undefined;
        grpcHost?: string | undefined;
        grpcPort?: number | undefined;
    } & {
        serial?: string | undefined;
        grpcHost?: string | undefined;
        grpcPort?: number | undefined;
    } & { [K in Exclude<keyof I, keyof DcIdcOpenGrpcClientParam>]: never; }>(object: I): DcIdcOpenGrpcClientParam;
};
export declare const DcIdcOpenGrpcClientResult: {
    encode(_: DcIdcOpenGrpcClientResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcOpenGrpcClientResult;
    fromJSON(_: any): DcIdcOpenGrpcClientResult;
    toJSON(_: DcIdcOpenGrpcClientResult): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DcIdcOpenGrpcClientResult;
};
export declare const DcIdcCheckGrpcHealthParam: {
    encode(message: DcIdcCheckGrpcHealthParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcCheckGrpcHealthParam;
    fromJSON(object: any): DcIdcCheckGrpcHealthParam;
    toJSON(message: DcIdcCheckGrpcHealthParam): unknown;
    fromPartial<I extends {
        serial?: string | undefined;
    } & {
        serial?: string | undefined;
    } & { [K in Exclude<keyof I, "serial">]: never; }>(object: I): DcIdcCheckGrpcHealthParam;
};
export declare const DcIdcCheckGrpcHealthResult: {
    encode(_: DcIdcCheckGrpcHealthResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcCheckGrpcHealthResult;
    fromJSON(_: any): DcIdcCheckGrpcHealthResult;
    toJSON(_: DcIdcCheckGrpcHealthResult): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DcIdcCheckGrpcHealthResult;
};
export declare const DcIdcStartScreenRecordParam: {
    encode(message: DcIdcStartScreenRecordParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcStartScreenRecordParam;
    fromJSON(object: any): DcIdcStartScreenRecordParam;
    toJSON(message: DcIdcStartScreenRecordParam): unknown;
    fromPartial<I extends {
        serial?: string | undefined;
        option?: {
            screen?: {
                bitRate?: number | undefined;
                maxFps?: number | undefined;
                frameRate?: number | undefined;
                frameInterval?: number | undefined;
                repeatFrameDelay?: number | undefined;
                maxResolution?: number | undefined;
                screenId?: number | undefined;
                pid?: number | undefined;
            } | undefined;
            filePath?: string | undefined;
            etcParam?: string | undefined;
        } | undefined;
    } & {
        serial?: string | undefined;
        option?: ({
            screen?: {
                bitRate?: number | undefined;
                maxFps?: number | undefined;
                frameRate?: number | undefined;
                frameInterval?: number | undefined;
                repeatFrameDelay?: number | undefined;
                maxResolution?: number | undefined;
                screenId?: number | undefined;
                pid?: number | undefined;
            } | undefined;
            filePath?: string | undefined;
            etcParam?: string | undefined;
        } & {
            screen?: ({
                bitRate?: number | undefined;
                maxFps?: number | undefined;
                frameRate?: number | undefined;
                frameInterval?: number | undefined;
                repeatFrameDelay?: number | undefined;
                maxResolution?: number | undefined;
                screenId?: number | undefined;
                pid?: number | undefined;
            } & {
                bitRate?: number | undefined;
                maxFps?: number | undefined;
                frameRate?: number | undefined;
                frameInterval?: number | undefined;
                repeatFrameDelay?: number | undefined;
                maxResolution?: number | undefined;
                screenId?: number | undefined;
                pid?: number | undefined;
            } & { [K in Exclude<keyof I["option"]["screen"], keyof import("../../index").ScreenCaptureOption>]: never; }) | undefined;
            filePath?: string | undefined;
            etcParam?: string | undefined;
        } & { [K_1 in Exclude<keyof I["option"], keyof ScreenRecordOption>]: never; }) | undefined;
    } & { [K_2 in Exclude<keyof I, keyof DcIdcStartScreenRecordParam>]: never; }>(object: I): DcIdcStartScreenRecordParam;
};
export declare const DcIdcStartScreenRecordResult: {
    encode(message: DcIdcStartScreenRecordResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcStartScreenRecordResult;
    fromJSON(object: any): DcIdcStartScreenRecordResult;
    toJSON(message: DcIdcStartScreenRecordResult): unknown;
    fromPartial<I extends {
        error?: {
            code?: import("../../outer/errors").Code | undefined;
            message?: string | undefined;
            details?: {
                [x: string]: any;
            } | undefined;
        } | undefined;
    } & {
        error?: ({
            code?: import("../../outer/errors").Code | undefined;
            message?: string | undefined;
            details?: {
                [x: string]: any;
            } | undefined;
        } & {
            code?: import("../../outer/errors").Code | undefined;
            message?: string | undefined;
            details?: ({
                [x: string]: any;
            } & {
                [x: string]: any;
            } & { [K in Exclude<keyof I["error"]["details"], string | number>]: never; }) | undefined;
        } & { [K_1 in Exclude<keyof I["error"], keyof ErrorResult>]: never; }) | undefined;
    } & { [K_2 in Exclude<keyof I, "error">]: never; }>(object: I): DcIdcStartScreenRecordResult;
};
export declare const DcIdcStopScreenRecordParam: {
    encode(message: DcIdcStopScreenRecordParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcStopScreenRecordParam;
    fromJSON(object: any): DcIdcStopScreenRecordParam;
    toJSON(message: DcIdcStopScreenRecordParam): unknown;
    fromPartial<I extends {
        serial?: string | undefined;
    } & {
        serial?: string | undefined;
    } & { [K in Exclude<keyof I, "serial">]: never; }>(object: I): DcIdcStopScreenRecordParam;
};
export declare const DcIdcStopScreenRecordResult: {
    encode(message: DcIdcStopScreenRecordResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcStopScreenRecordResult;
    fromJSON(object: any): DcIdcStopScreenRecordResult;
    toJSON(message: DcIdcStopScreenRecordResult): unknown;
    fromPartial<I extends {
        error?: {
            code?: import("../../outer/errors").Code | undefined;
            message?: string | undefined;
            details?: {
                [x: string]: any;
            } | undefined;
        } | undefined;
        filePath?: string | undefined;
    } & {
        error?: ({
            code?: import("../../outer/errors").Code | undefined;
            message?: string | undefined;
            details?: {
                [x: string]: any;
            } | undefined;
        } & {
            code?: import("../../outer/errors").Code | undefined;
            message?: string | undefined;
            details?: ({
                [x: string]: any;
            } & {
                [x: string]: any;
            } & { [K in Exclude<keyof I["error"]["details"], string | number>]: never; }) | undefined;
        } & { [K_1 in Exclude<keyof I["error"], keyof ErrorResult>]: never; }) | undefined;
        filePath?: string | undefined;
    } & { [K_2 in Exclude<keyof I, keyof DcIdcStopScreenRecordResult>]: never; }>(object: I): DcIdcStopScreenRecordResult;
};
