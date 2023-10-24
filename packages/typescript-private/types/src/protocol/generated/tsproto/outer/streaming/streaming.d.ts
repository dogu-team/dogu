import _m0 from 'protobufjs/minimal';
import { ErrorResult } from '../errors';
import { Platform } from '../platform';
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
    value?: {
        $case: 'startStreaming';
        startStreaming: StartStreaming;
    } | {
        $case: 'iceCandidate';
        iceCandidate: ProtoRTCIceCandidateInit;
    };
}
export interface StreamingAnswer {
    value?: {
        $case: 'peerDescription';
        peerDescription: ProtoRTCPeerDescription;
    } | {
        $case: 'iceCandidate';
        iceCandidate: ProtoRTCIceCandidateInit;
    } | {
        $case: 'errorResult';
        errorResult: ErrorResult;
    };
}
export declare const StreamingOption: {
    encode(message: StreamingOption, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): StreamingOption;
    fromJSON(object: any): StreamingOption;
    toJSON(message: StreamingOption): unknown;
    fromPartial<I extends {
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
        } & { [K in Exclude<keyof I["screen"], keyof ScreenCaptureOption>]: never; }) | undefined;
    } & { [K_1 in Exclude<keyof I, "screen">]: never; }>(object: I): StreamingOption;
};
export declare const StartStreaming: {
    encode(message: StartStreaming, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): StartStreaming;
    fromJSON(object: any): StartStreaming;
    toJSON(message: StartStreaming): unknown;
    fromPartial<I extends {
        peerDescription?: {
            sdpBase64?: string | undefined;
            type?: import("./webrtc").ProtoRTCSdpType | undefined;
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
            type?: import("./webrtc").ProtoRTCSdpType | undefined;
        } & {
            sdpBase64?: string | undefined;
            type?: import("./webrtc").ProtoRTCSdpType | undefined;
        } & { [K in Exclude<keyof I["peerDescription"], keyof ProtoRTCPeerDescription>]: never; }) | undefined;
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
            } & { [K_1 in Exclude<keyof I["option"]["screen"], keyof ScreenCaptureOption>]: never; }) | undefined;
        } & { [K_2 in Exclude<keyof I["option"], "screen">]: never; }) | undefined;
        turnServerUrl?: string | undefined;
        turnServerUsername?: string | undefined;
        turnServerPassword?: string | undefined;
        platform?: Platform | undefined;
    } & { [K_3 in Exclude<keyof I, keyof StartStreaming>]: never; }>(object: I): StartStreaming;
};
export declare const StreamingOffer: {
    encode(message: StreamingOffer, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): StreamingOffer;
    fromJSON(object: any): StreamingOffer;
    toJSON(message: StreamingOffer): unknown;
    fromPartial<I extends {
        serial?: string | undefined;
        value?: ({
            startStreaming?: {
                peerDescription?: {
                    sdpBase64?: string | undefined;
                    type?: import("./webrtc").ProtoRTCSdpType | undefined;
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
                    type?: import("./webrtc").ProtoRTCSdpType | undefined;
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
                    type?: import("./webrtc").ProtoRTCSdpType | undefined;
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
                    type?: import("./webrtc").ProtoRTCSdpType | undefined;
                } & {
                    sdpBase64?: string | undefined;
                    type?: import("./webrtc").ProtoRTCSdpType | undefined;
                } & { [K in Exclude<keyof I["value"]["startStreaming"]["peerDescription"], keyof ProtoRTCPeerDescription>]: never; }) | undefined;
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
                    } & { [K_1 in Exclude<keyof I["value"]["startStreaming"]["option"]["screen"], keyof ScreenCaptureOption>]: never; }) | undefined;
                } & { [K_2 in Exclude<keyof I["value"]["startStreaming"]["option"], "screen">]: never; }) | undefined;
                turnServerUrl?: string | undefined;
                turnServerUsername?: string | undefined;
                turnServerPassword?: string | undefined;
                platform?: Platform | undefined;
            } & { [K_3 in Exclude<keyof I["value"]["startStreaming"], keyof StartStreaming>]: never; }) | undefined;
            $case: "startStreaming";
        } & { [K_4 in Exclude<keyof I["value"], "$case" | "startStreaming">]: never; }) | ({
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
            } & { [K_5 in Exclude<keyof I["value"]["iceCandidate"], keyof ProtoRTCIceCandidateInit>]: never; }) | undefined;
            $case: "iceCandidate";
        } & { [K_6 in Exclude<keyof I["value"], "$case" | "iceCandidate">]: never; }) | undefined;
    } & { [K_7 in Exclude<keyof I, keyof StreamingOffer>]: never; }>(object: I): StreamingOffer;
};
export declare const StreamingAnswer: {
    encode(message: StreamingAnswer, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): StreamingAnswer;
    fromJSON(object: any): StreamingAnswer;
    toJSON(message: StreamingAnswer): unknown;
    fromPartial<I extends {
        value?: ({
            peerDescription?: {
                sdpBase64?: string | undefined;
                type?: import("./webrtc").ProtoRTCSdpType | undefined;
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
                code?: import("../errors").Code | undefined;
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
                type?: import("./webrtc").ProtoRTCSdpType | undefined;
            } | undefined;
        } & {
            $case: "peerDescription";
        } & {
            peerDescription?: ({
                sdpBase64?: string | undefined;
                type?: import("./webrtc").ProtoRTCSdpType | undefined;
            } & {
                sdpBase64?: string | undefined;
                type?: import("./webrtc").ProtoRTCSdpType | undefined;
            } & { [K in Exclude<keyof I["value"]["peerDescription"], keyof ProtoRTCPeerDescription>]: never; }) | undefined;
            $case: "peerDescription";
        } & { [K_1 in Exclude<keyof I["value"], "$case" | "peerDescription">]: never; }) | ({
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
            } & { [K_2 in Exclude<keyof I["value"]["iceCandidate"], keyof ProtoRTCIceCandidateInit>]: never; }) | undefined;
            $case: "iceCandidate";
        } & { [K_3 in Exclude<keyof I["value"], "$case" | "iceCandidate">]: never; }) | ({
            errorResult?: {
                code?: import("../errors").Code | undefined;
                message?: string | undefined;
                details?: {
                    [x: string]: any;
                } | undefined;
            } | undefined;
        } & {
            $case: "errorResult";
        } & {
            errorResult?: ({
                code?: import("../errors").Code | undefined;
                message?: string | undefined;
                details?: {
                    [x: string]: any;
                } | undefined;
            } & {
                code?: import("../errors").Code | undefined;
                message?: string | undefined;
                details?: ({
                    [x: string]: any;
                } & {
                    [x: string]: any;
                } & { [K_4 in Exclude<keyof I["value"]["errorResult"]["details"], string | number>]: never; }) | undefined;
            } & { [K_5 in Exclude<keyof I["value"]["errorResult"], keyof ErrorResult>]: never; }) | undefined;
            $case: "errorResult";
        } & { [K_6 in Exclude<keyof I["value"], "$case" | "errorResult">]: never; }) | undefined;
    } & { [K_7 in Exclude<keyof I, "value">]: never; }>(object: I): StreamingAnswer;
};
