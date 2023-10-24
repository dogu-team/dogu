import _m0 from 'protobufjs/minimal';
import { DcGdcGetSurfaceStatusParam, DcGdcGetSurfaceStatusResult, DcGdcStartScreenRecordParam, DcGdcStartScreenRecordResult, DcGdcStopScreenRecordParam, DcGdcStopScreenRecordResult, DcGdcUpdateDeviceListParam, DcGdcUpdateDeviceListResult } from '../types/dc_gdc';
export interface DcGdcParam {
    value?: {
        $case: 'dcGdcUpdateDevicelistParam';
        dcGdcUpdateDevicelistParam: DcGdcUpdateDeviceListParam;
    } | {
        $case: 'dcGdcStartScreenRecordParam';
        dcGdcStartScreenRecordParam: DcGdcStartScreenRecordParam;
    } | {
        $case: 'dcGdcStopScreenRecordParam';
        dcGdcStopScreenRecordParam: DcGdcStopScreenRecordParam;
    } | {
        $case: 'dcGdcGetSurfaceStatusParam';
        dcGdcGetSurfaceStatusParam: DcGdcGetSurfaceStatusParam;
    };
}
export interface DcGdcResult {
    value?: {
        $case: 'dcGdcUpdateDevicelistResult';
        dcGdcUpdateDevicelistResult: DcGdcUpdateDeviceListResult;
    } | {
        $case: 'dcGdcStartScreenRecordResult';
        dcGdcStartScreenRecordResult: DcGdcStartScreenRecordResult;
    } | {
        $case: 'dcGdcStopScreenRecordResult';
        dcGdcStopScreenRecordResult: DcGdcStopScreenRecordResult;
    } | {
        $case: 'dcGdcGetSurfaceStatusResult';
        dcGdcGetSurfaceStatusResult: DcGdcGetSurfaceStatusResult;
    };
}
export declare const DcGdcParam: {
    encode(message: DcGdcParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcParam;
    fromJSON(object: any): DcGdcParam;
    toJSON(message: DcGdcParam): unknown;
    fromPartial<I extends {
        value?: ({
            dcGdcUpdateDevicelistParam?: {
                devices?: {
                    serial?: string | undefined;
                    platform?: import("../../index").Platform | undefined;
                    screenUrl?: string | undefined;
                    inputUrl?: string | undefined;
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                }[] | undefined;
            } | undefined;
        } & {
            $case: "dcGdcUpdateDevicelistParam";
        }) | ({
            dcGdcStartScreenRecordParam?: {
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
            } | undefined;
        } & {
            $case: "dcGdcStartScreenRecordParam";
        }) | ({
            dcGdcStopScreenRecordParam?: {
                serial?: string | undefined;
                filePath?: string | undefined;
            } | undefined;
        } & {
            $case: "dcGdcStopScreenRecordParam";
        }) | ({
            dcGdcGetSurfaceStatusParam?: {
                serial?: string | undefined;
                screenId?: number | undefined;
                pid?: number | undefined;
            } | undefined;
        } & {
            $case: "dcGdcGetSurfaceStatusParam";
        }) | undefined;
    } & {
        value?: ({
            dcGdcUpdateDevicelistParam?: {
                devices?: {
                    serial?: string | undefined;
                    platform?: import("../../index").Platform | undefined;
                    screenUrl?: string | undefined;
                    inputUrl?: string | undefined;
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                }[] | undefined;
            } | undefined;
        } & {
            $case: "dcGdcUpdateDevicelistParam";
        } & {
            dcGdcUpdateDevicelistParam?: ({
                devices?: {
                    serial?: string | undefined;
                    platform?: import("../../index").Platform | undefined;
                    screenUrl?: string | undefined;
                    inputUrl?: string | undefined;
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                }[] | undefined;
            } & {
                devices?: ({
                    serial?: string | undefined;
                    platform?: import("../../index").Platform | undefined;
                    screenUrl?: string | undefined;
                    inputUrl?: string | undefined;
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                }[] & ({
                    serial?: string | undefined;
                    platform?: import("../../index").Platform | undefined;
                    screenUrl?: string | undefined;
                    inputUrl?: string | undefined;
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                } & {
                    serial?: string | undefined;
                    platform?: import("../../index").Platform | undefined;
                    screenUrl?: string | undefined;
                    inputUrl?: string | undefined;
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                } & { [K in Exclude<keyof I["value"]["dcGdcUpdateDevicelistParam"]["devices"][number], keyof import("../types/dc_gdc").DcGdcDeviceContext>]: never; })[] & { [K_1 in Exclude<keyof I["value"]["dcGdcUpdateDevicelistParam"]["devices"], keyof {
                    serial?: string | undefined;
                    platform?: import("../../index").Platform | undefined;
                    screenUrl?: string | undefined;
                    inputUrl?: string | undefined;
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                }[]>]: never; }) | undefined;
            } & { [K_2 in Exclude<keyof I["value"]["dcGdcUpdateDevicelistParam"], "devices">]: never; }) | undefined;
            $case: "dcGdcUpdateDevicelistParam";
        } & { [K_3 in Exclude<keyof I["value"], "$case" | "dcGdcUpdateDevicelistParam">]: never; }) | ({
            dcGdcStartScreenRecordParam?: {
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
            } | undefined;
        } & {
            $case: "dcGdcStartScreenRecordParam";
        } & {
            dcGdcStartScreenRecordParam?: ({
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
                    } & { [K_4 in Exclude<keyof I["value"]["dcGdcStartScreenRecordParam"]["option"]["screen"], keyof import("../../index").ScreenCaptureOption>]: never; }) | undefined;
                    filePath?: string | undefined;
                    etcParam?: string | undefined;
                } & { [K_5 in Exclude<keyof I["value"]["dcGdcStartScreenRecordParam"]["option"], keyof import("../../index").ScreenRecordOption>]: never; }) | undefined;
            } & { [K_6 in Exclude<keyof I["value"]["dcGdcStartScreenRecordParam"], keyof DcGdcStartScreenRecordParam>]: never; }) | undefined;
            $case: "dcGdcStartScreenRecordParam";
        } & { [K_7 in Exclude<keyof I["value"], "$case" | "dcGdcStartScreenRecordParam">]: never; }) | ({
            dcGdcStopScreenRecordParam?: {
                serial?: string | undefined;
                filePath?: string | undefined;
            } | undefined;
        } & {
            $case: "dcGdcStopScreenRecordParam";
        } & {
            dcGdcStopScreenRecordParam?: ({
                serial?: string | undefined;
                filePath?: string | undefined;
            } & {
                serial?: string | undefined;
                filePath?: string | undefined;
            } & { [K_8 in Exclude<keyof I["value"]["dcGdcStopScreenRecordParam"], keyof DcGdcStopScreenRecordParam>]: never; }) | undefined;
            $case: "dcGdcStopScreenRecordParam";
        } & { [K_9 in Exclude<keyof I["value"], "$case" | "dcGdcStopScreenRecordParam">]: never; }) | ({
            dcGdcGetSurfaceStatusParam?: {
                serial?: string | undefined;
                screenId?: number | undefined;
                pid?: number | undefined;
            } | undefined;
        } & {
            $case: "dcGdcGetSurfaceStatusParam";
        } & {
            dcGdcGetSurfaceStatusParam?: ({
                serial?: string | undefined;
                screenId?: number | undefined;
                pid?: number | undefined;
            } & {
                serial?: string | undefined;
                screenId?: number | undefined;
                pid?: number | undefined;
            } & { [K_10 in Exclude<keyof I["value"]["dcGdcGetSurfaceStatusParam"], keyof DcGdcGetSurfaceStatusParam>]: never; }) | undefined;
            $case: "dcGdcGetSurfaceStatusParam";
        } & { [K_11 in Exclude<keyof I["value"], "$case" | "dcGdcGetSurfaceStatusParam">]: never; }) | undefined;
    } & { [K_12 in Exclude<keyof I, "value">]: never; }>(object: I): DcGdcParam;
};
export declare const DcGdcResult: {
    encode(message: DcGdcResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcGdcResult;
    fromJSON(object: any): DcGdcResult;
    toJSON(message: DcGdcResult): unknown;
    fromPartial<I extends {
        value?: ({
            dcGdcUpdateDevicelistResult?: {} | undefined;
        } & {
            $case: "dcGdcUpdateDevicelistResult";
        }) | ({
            dcGdcStartScreenRecordResult?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "dcGdcStartScreenRecordResult";
        }) | ({
            dcGdcStopScreenRecordResult?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
                filePath?: string | undefined;
            } | undefined;
        } & {
            $case: "dcGdcStopScreenRecordResult";
        }) | ({
            dcGdcGetSurfaceStatusResult?: {
                hasSurface?: boolean | undefined;
                isPlaying?: boolean | undefined;
                lastFrameDeltaMillisec?: number | undefined;
            } | undefined;
        } & {
            $case: "dcGdcGetSurfaceStatusResult";
        }) | undefined;
    } & {
        value?: ({
            dcGdcUpdateDevicelistResult?: {} | undefined;
        } & {
            $case: "dcGdcUpdateDevicelistResult";
        } & {
            dcGdcUpdateDevicelistResult?: ({} & {} & { [K in Exclude<keyof I["value"]["dcGdcUpdateDevicelistResult"], never>]: never; }) | undefined;
            $case: "dcGdcUpdateDevicelistResult";
        } & { [K_1 in Exclude<keyof I["value"], "$case" | "dcGdcUpdateDevicelistResult">]: never; }) | ({
            dcGdcStartScreenRecordResult?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "dcGdcStartScreenRecordResult";
        } & {
            dcGdcStartScreenRecordResult?: ({
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } & {
                error?: ({
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } & {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: ({
                        [x: string]: any;
                    } & {
                        [x: string]: any;
                    } & { [K_2 in Exclude<keyof I["value"]["dcGdcStartScreenRecordResult"]["error"]["details"], string | number>]: never; }) | undefined;
                } & { [K_3 in Exclude<keyof I["value"]["dcGdcStartScreenRecordResult"]["error"], keyof import("../../index").ErrorResult>]: never; }) | undefined;
            } & { [K_4 in Exclude<keyof I["value"]["dcGdcStartScreenRecordResult"], "error">]: never; }) | undefined;
            $case: "dcGdcStartScreenRecordResult";
        } & { [K_5 in Exclude<keyof I["value"], "$case" | "dcGdcStartScreenRecordResult">]: never; }) | ({
            dcGdcStopScreenRecordResult?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
                filePath?: string | undefined;
            } | undefined;
        } & {
            $case: "dcGdcStopScreenRecordResult";
        } & {
            dcGdcStopScreenRecordResult?: ({
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
                filePath?: string | undefined;
            } & {
                error?: ({
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } & {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: ({
                        [x: string]: any;
                    } & {
                        [x: string]: any;
                    } & { [K_6 in Exclude<keyof I["value"]["dcGdcStopScreenRecordResult"]["error"]["details"], string | number>]: never; }) | undefined;
                } & { [K_7 in Exclude<keyof I["value"]["dcGdcStopScreenRecordResult"]["error"], keyof import("../../index").ErrorResult>]: never; }) | undefined;
                filePath?: string | undefined;
            } & { [K_8 in Exclude<keyof I["value"]["dcGdcStopScreenRecordResult"], keyof DcGdcStopScreenRecordResult>]: never; }) | undefined;
            $case: "dcGdcStopScreenRecordResult";
        } & { [K_9 in Exclude<keyof I["value"], "$case" | "dcGdcStopScreenRecordResult">]: never; }) | ({
            dcGdcGetSurfaceStatusResult?: {
                hasSurface?: boolean | undefined;
                isPlaying?: boolean | undefined;
                lastFrameDeltaMillisec?: number | undefined;
            } | undefined;
        } & {
            $case: "dcGdcGetSurfaceStatusResult";
        } & {
            dcGdcGetSurfaceStatusResult?: ({
                hasSurface?: boolean | undefined;
                isPlaying?: boolean | undefined;
                lastFrameDeltaMillisec?: number | undefined;
            } & {
                hasSurface?: boolean | undefined;
                isPlaying?: boolean | undefined;
                lastFrameDeltaMillisec?: number | undefined;
            } & { [K_10 in Exclude<keyof I["value"]["dcGdcGetSurfaceStatusResult"], keyof DcGdcGetSurfaceStatusResult>]: never; }) | undefined;
            $case: "dcGdcGetSurfaceStatusResult";
        } & { [K_11 in Exclude<keyof I["value"], "$case" | "dcGdcGetSurfaceStatusResult">]: never; }) | undefined;
    } & { [K_12 in Exclude<keyof I, "value">]: never; }>(object: I): DcGdcResult;
};
