import _m0 from 'protobufjs/minimal';
import { ErrorResult } from '../../outer/errors';
import { Platform } from '../../outer/platform';
import { ScreenRecordOption } from '../../outer/streaming/screenrecord_option';
import { StreamingAnswer, StreamingOffer } from '../../outer/streaming/streaming';
export interface DcGdcDeviceContext {
    serial: string;
    platform: Platform;
    screenUrl: string;
    inputUrl: string;
    screenWidth: number;
    screenHeight: number;
}
export interface DcGdcUpdateDeviceListParam {
    devices: DcGdcDeviceContext[];
}
export interface DcGdcUpdateDeviceListResult {
}
export interface DcGdcStartStreamingParam {
    offer: StreamingOffer | undefined;
}
export interface DcGdcStartStreamingResult {
    answer: StreamingAnswer | undefined;
}
export interface DcGdcStopStreamingParam {
    serial: string;
}
export interface DcGdcStopStreamingResult {
}
export interface DcGdcStartScreenRecordParam {
    serial: string;
    option: ScreenRecordOption | undefined;
}
export interface DcGdcStartScreenRecordResult {
    error: ErrorResult | undefined;
}
export interface DcGdcStopScreenRecordParam {
    serial: string;
    filePath: string;
}
export interface DcGdcStopScreenRecordResult {
    error: ErrorResult | undefined;
    filePath: string;
}
export interface DcGdcGetSurfaceStatusParam {
    serial: string;
    screenId?: number | undefined;
    pid?: number | undefined;
}
export interface DcGdcGetSurfaceStatusResult {
    hasSurface: boolean;
    isPlaying: boolean;
    lastFrameDeltaMillisec: number;
}
export declare const DcGdcDeviceContext: {
    encode(message: DcGdcDeviceContext, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcDeviceContext;
    fromJSON(object: any): DcGdcDeviceContext;
    toJSON(message: DcGdcDeviceContext): unknown;
    fromPartial<I extends {
        serial?: string | undefined;
        platform?: Platform | undefined;
        screenUrl?: string | undefined;
        inputUrl?: string | undefined;
        screenWidth?: number | undefined;
        screenHeight?: number | undefined;
    } & {
        serial?: string | undefined;
        platform?: Platform | undefined;
        screenUrl?: string | undefined;
        inputUrl?: string | undefined;
        screenWidth?: number | undefined;
        screenHeight?: number | undefined;
    } & { [K in Exclude<keyof I, keyof DcGdcDeviceContext>]: never; }>(object: I): DcGdcDeviceContext;
};
export declare const DcGdcUpdateDeviceListParam: {
    encode(message: DcGdcUpdateDeviceListParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcUpdateDeviceListParam;
    fromJSON(object: any): DcGdcUpdateDeviceListParam;
    toJSON(message: DcGdcUpdateDeviceListParam): unknown;
    fromPartial<I extends {
        devices?: {
            serial?: string | undefined;
            platform?: Platform | undefined;
            screenUrl?: string | undefined;
            inputUrl?: string | undefined;
            screenWidth?: number | undefined;
            screenHeight?: number | undefined;
        }[] | undefined;
    } & {
        devices?: ({
            serial?: string | undefined;
            platform?: Platform | undefined;
            screenUrl?: string | undefined;
            inputUrl?: string | undefined;
            screenWidth?: number | undefined;
            screenHeight?: number | undefined;
        }[] & ({
            serial?: string | undefined;
            platform?: Platform | undefined;
            screenUrl?: string | undefined;
            inputUrl?: string | undefined;
            screenWidth?: number | undefined;
            screenHeight?: number | undefined;
        } & {
            serial?: string | undefined;
            platform?: Platform | undefined;
            screenUrl?: string | undefined;
            inputUrl?: string | undefined;
            screenWidth?: number | undefined;
            screenHeight?: number | undefined;
        } & { [K in Exclude<keyof I["devices"][number], keyof DcGdcDeviceContext>]: never; })[] & { [K_1 in Exclude<keyof I["devices"], keyof {
            serial?: string | undefined;
            platform?: Platform | undefined;
            screenUrl?: string | undefined;
            inputUrl?: string | undefined;
            screenWidth?: number | undefined;
            screenHeight?: number | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_2 in Exclude<keyof I, "devices">]: never; }>(object: I): DcGdcUpdateDeviceListParam;
};
export declare const DcGdcUpdateDeviceListResult: {
    encode(_: DcGdcUpdateDeviceListResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcUpdateDeviceListResult;
    fromJSON(_: any): DcGdcUpdateDeviceListResult;
    toJSON(_: DcGdcUpdateDeviceListResult): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DcGdcUpdateDeviceListResult;
};
export declare const DcGdcStartStreamingParam: {
    encode(message: DcGdcStartStreamingParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStartStreamingParam;
    fromJSON(object: any): DcGdcStartStreamingParam;
    toJSON(message: DcGdcStartStreamingParam): unknown;
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
                    platform?: Platform | undefined;
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
                    platform?: Platform | undefined;
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
                    platform?: Platform | undefined;
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
                    platform?: Platform | undefined;
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
                    platform?: Platform | undefined;
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
    } & { [K_8 in Exclude<keyof I, "offer">]: never; }>(object: I): DcGdcStartStreamingParam;
};
export declare const DcGdcStartStreamingResult: {
    encode(message: DcGdcStartStreamingResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStartStreamingResult;
    fromJSON(object: any): DcGdcStartStreamingResult;
    toJSON(message: DcGdcStartStreamingResult): unknown;
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
    } & { [K_8 in Exclude<keyof I, "answer">]: never; }>(object: I): DcGdcStartStreamingResult;
};
export declare const DcGdcStopStreamingParam: {
    encode(message: DcGdcStopStreamingParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStopStreamingParam;
    fromJSON(object: any): DcGdcStopStreamingParam;
    toJSON(message: DcGdcStopStreamingParam): unknown;
    fromPartial<I extends {
        serial?: string | undefined;
    } & {
        serial?: string | undefined;
    } & { [K in Exclude<keyof I, "serial">]: never; }>(object: I): DcGdcStopStreamingParam;
};
export declare const DcGdcStopStreamingResult: {
    encode(_: DcGdcStopStreamingResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStopStreamingResult;
    fromJSON(_: any): DcGdcStopStreamingResult;
    toJSON(_: DcGdcStopStreamingResult): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DcGdcStopStreamingResult;
};
export declare const DcGdcStartScreenRecordParam: {
    encode(message: DcGdcStartScreenRecordParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStartScreenRecordParam;
    fromJSON(object: any): DcGdcStartScreenRecordParam;
    toJSON(message: DcGdcStartScreenRecordParam): unknown;
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
    } & { [K_2 in Exclude<keyof I, keyof DcGdcStartScreenRecordParam>]: never; }>(object: I): DcGdcStartScreenRecordParam;
};
export declare const DcGdcStartScreenRecordResult: {
    encode(message: DcGdcStartScreenRecordResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStartScreenRecordResult;
    fromJSON(object: any): DcGdcStartScreenRecordResult;
    toJSON(message: DcGdcStartScreenRecordResult): unknown;
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
    } & { [K_2 in Exclude<keyof I, "error">]: never; }>(object: I): DcGdcStartScreenRecordResult;
};
export declare const DcGdcStopScreenRecordParam: {
    encode(message: DcGdcStopScreenRecordParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStopScreenRecordParam;
    fromJSON(object: any): DcGdcStopScreenRecordParam;
    toJSON(message: DcGdcStopScreenRecordParam): unknown;
    fromPartial<I extends {
        serial?: string | undefined;
        filePath?: string | undefined;
    } & {
        serial?: string | undefined;
        filePath?: string | undefined;
    } & { [K in Exclude<keyof I, keyof DcGdcStopScreenRecordParam>]: never; }>(object: I): DcGdcStopScreenRecordParam;
};
export declare const DcGdcStopScreenRecordResult: {
    encode(message: DcGdcStopScreenRecordResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcStopScreenRecordResult;
    fromJSON(object: any): DcGdcStopScreenRecordResult;
    toJSON(message: DcGdcStopScreenRecordResult): unknown;
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
    } & { [K_2 in Exclude<keyof I, keyof DcGdcStopScreenRecordResult>]: never; }>(object: I): DcGdcStopScreenRecordResult;
};
export declare const DcGdcGetSurfaceStatusParam: {
    encode(message: DcGdcGetSurfaceStatusParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcGetSurfaceStatusParam;
    fromJSON(object: any): DcGdcGetSurfaceStatusParam;
    toJSON(message: DcGdcGetSurfaceStatusParam): unknown;
    fromPartial<I extends {
        serial?: string | undefined;
        screenId?: number | undefined;
        pid?: number | undefined;
    } & {
        serial?: string | undefined;
        screenId?: number | undefined;
        pid?: number | undefined;
    } & { [K in Exclude<keyof I, keyof DcGdcGetSurfaceStatusParam>]: never; }>(object: I): DcGdcGetSurfaceStatusParam;
};
export declare const DcGdcGetSurfaceStatusResult: {
    encode(message: DcGdcGetSurfaceStatusResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcGetSurfaceStatusResult;
    fromJSON(object: any): DcGdcGetSurfaceStatusResult;
    toJSON(message: DcGdcGetSurfaceStatusResult): unknown;
    fromPartial<I extends {
        hasSurface?: boolean | undefined;
        isPlaying?: boolean | undefined;
        lastFrameDeltaMillisec?: number | undefined;
    } & {
        hasSurface?: boolean | undefined;
        isPlaying?: boolean | undefined;
        lastFrameDeltaMillisec?: number | undefined;
    } & { [K in Exclude<keyof I, keyof DcGdcGetSurfaceStatusResult>]: never; }>(object: I): DcGdcGetSurfaceStatusResult;
};
