import _m0 from 'protobufjs/minimal';
import { DcIdcCheckGrpcHealthParam, DcIdcCheckGrpcHealthResult, DcIdcOpenGrpcClientParam, DcIdcOpenGrpcClientResult, DcIdcScanIdsParam, DcIdcScanIdsResult, DcIdcStartScreenRecordParam, DcIdcStartScreenRecordResult, DcIdcStopScreenRecordParam, DcIdcStopScreenRecordResult } from '../types/dc_idc';
export interface DcIdcParam {
    value?: {
        $case: 'dcIdcScanIdsParam';
        dcIdcScanIdsParam: DcIdcScanIdsParam;
    } | {
        $case: 'dcIdcOpenGrpcClientParam';
        dcIdcOpenGrpcClientParam: DcIdcOpenGrpcClientParam;
    } | {
        $case: 'dcIdcCheckGrpcHealthParam';
        dcIdcCheckGrpcHealthParam: DcIdcCheckGrpcHealthParam;
    } | {
        $case: 'dcIdcStartScreenRecordParam';
        dcIdcStartScreenRecordParam: DcIdcStartScreenRecordParam;
    } | {
        $case: 'dcIdcStopScreenRecordParam';
        dcIdcStopScreenRecordParam: DcIdcStopScreenRecordParam;
    };
}
export interface DcIdcResult {
    value?: {
        $case: 'dcIdcScanIdsResult';
        dcIdcScanIdsResult: DcIdcScanIdsResult;
    } | {
        $case: 'dcIdcOpenGrpcClientResult';
        dcIdcOpenGrpcClientResult: DcIdcOpenGrpcClientResult;
    } | {
        $case: 'dcIdcCheckGrpcHealthResult';
        dcIdcCheckGrpcHealthResult: DcIdcCheckGrpcHealthResult;
    } | {
        $case: 'dcIdcStartScreenRecordResult';
        dcIdcStartScreenRecordResult: DcIdcStartScreenRecordResult;
    } | {
        $case: 'dcIdcStopScreenRecordResult';
        dcIdcStopScreenRecordResult: DcIdcStopScreenRecordResult;
    };
}
export declare const DcIdcParam: {
    encode(message: DcIdcParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcParam;
    fromJSON(object: any): DcIdcParam;
    toJSON(message: DcIdcParam): unknown;
    fromPartial<I extends {
        value?: ({
            dcIdcScanIdsParam?: {} | undefined;
        } & {
            $case: "dcIdcScanIdsParam";
        }) | ({
            dcIdcOpenGrpcClientParam?: {
                serial?: string | undefined;
                grpcHost?: string | undefined;
                grpcPort?: number | undefined;
            } | undefined;
        } & {
            $case: "dcIdcOpenGrpcClientParam";
        }) | ({
            dcIdcCheckGrpcHealthParam?: {
                serial?: string | undefined;
            } | undefined;
        } & {
            $case: "dcIdcCheckGrpcHealthParam";
        }) | ({
            dcIdcStartScreenRecordParam?: {
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
            $case: "dcIdcStartScreenRecordParam";
        }) | ({
            dcIdcStopScreenRecordParam?: {
                serial?: string | undefined;
            } | undefined;
        } & {
            $case: "dcIdcStopScreenRecordParam";
        }) | undefined;
    } & {
        value?: ({
            dcIdcScanIdsParam?: {} | undefined;
        } & {
            $case: "dcIdcScanIdsParam";
        } & {
            dcIdcScanIdsParam?: ({} & {} & { [K in Exclude<keyof I["value"]["dcIdcScanIdsParam"], never>]: never; }) | undefined;
            $case: "dcIdcScanIdsParam";
        } & { [K_1 in Exclude<keyof I["value"], "$case" | "dcIdcScanIdsParam">]: never; }) | ({
            dcIdcOpenGrpcClientParam?: {
                serial?: string | undefined;
                grpcHost?: string | undefined;
                grpcPort?: number | undefined;
            } | undefined;
        } & {
            $case: "dcIdcOpenGrpcClientParam";
        } & {
            dcIdcOpenGrpcClientParam?: ({
                serial?: string | undefined;
                grpcHost?: string | undefined;
                grpcPort?: number | undefined;
            } & {
                serial?: string | undefined;
                grpcHost?: string | undefined;
                grpcPort?: number | undefined;
            } & { [K_2 in Exclude<keyof I["value"]["dcIdcOpenGrpcClientParam"], keyof DcIdcOpenGrpcClientParam>]: never; }) | undefined;
            $case: "dcIdcOpenGrpcClientParam";
        } & { [K_3 in Exclude<keyof I["value"], "$case" | "dcIdcOpenGrpcClientParam">]: never; }) | ({
            dcIdcCheckGrpcHealthParam?: {
                serial?: string | undefined;
            } | undefined;
        } & {
            $case: "dcIdcCheckGrpcHealthParam";
        } & {
            dcIdcCheckGrpcHealthParam?: ({
                serial?: string | undefined;
            } & {
                serial?: string | undefined;
            } & { [K_4 in Exclude<keyof I["value"]["dcIdcCheckGrpcHealthParam"], "serial">]: never; }) | undefined;
            $case: "dcIdcCheckGrpcHealthParam";
        } & { [K_5 in Exclude<keyof I["value"], "$case" | "dcIdcCheckGrpcHealthParam">]: never; }) | ({
            dcIdcStartScreenRecordParam?: {
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
            $case: "dcIdcStartScreenRecordParam";
        } & {
            dcIdcStartScreenRecordParam?: ({
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
                    } & { [K_6 in Exclude<keyof I["value"]["dcIdcStartScreenRecordParam"]["option"]["screen"], keyof import("../../index").ScreenCaptureOption>]: never; }) | undefined;
                    filePath?: string | undefined;
                    etcParam?: string | undefined;
                } & { [K_7 in Exclude<keyof I["value"]["dcIdcStartScreenRecordParam"]["option"], keyof import("../../index").ScreenRecordOption>]: never; }) | undefined;
            } & { [K_8 in Exclude<keyof I["value"]["dcIdcStartScreenRecordParam"], keyof DcIdcStartScreenRecordParam>]: never; }) | undefined;
            $case: "dcIdcStartScreenRecordParam";
        } & { [K_9 in Exclude<keyof I["value"], "$case" | "dcIdcStartScreenRecordParam">]: never; }) | ({
            dcIdcStopScreenRecordParam?: {
                serial?: string | undefined;
            } | undefined;
        } & {
            $case: "dcIdcStopScreenRecordParam";
        } & {
            dcIdcStopScreenRecordParam?: ({
                serial?: string | undefined;
            } & {
                serial?: string | undefined;
            } & { [K_10 in Exclude<keyof I["value"]["dcIdcStopScreenRecordParam"], "serial">]: never; }) | undefined;
            $case: "dcIdcStopScreenRecordParam";
        } & { [K_11 in Exclude<keyof I["value"], "$case" | "dcIdcStopScreenRecordParam">]: never; }) | undefined;
    } & { [K_12 in Exclude<keyof I, "value">]: never; }>(object: I): DcIdcParam;
};
export declare const DcIdcResult: {
    encode(message: DcIdcResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdcResult;
    fromJSON(object: any): DcIdcResult;
    toJSON(message: DcIdcResult): unknown;
    fromPartial<I extends {
        value?: ({
            dcIdcScanIdsResult?: {
                ids?: string[] | undefined;
            } | undefined;
        } & {
            $case: "dcIdcScanIdsResult";
        }) | ({
            dcIdcOpenGrpcClientResult?: {} | undefined;
        } & {
            $case: "dcIdcOpenGrpcClientResult";
        }) | ({
            dcIdcCheckGrpcHealthResult?: {} | undefined;
        } & {
            $case: "dcIdcCheckGrpcHealthResult";
        }) | ({
            dcIdcStartScreenRecordResult?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "dcIdcStartScreenRecordResult";
        }) | ({
            dcIdcStopScreenRecordResult?: {
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
            $case: "dcIdcStopScreenRecordResult";
        }) | undefined;
    } & {
        value?: ({
            dcIdcScanIdsResult?: {
                ids?: string[] | undefined;
            } | undefined;
        } & {
            $case: "dcIdcScanIdsResult";
        } & {
            dcIdcScanIdsResult?: ({
                ids?: string[] | undefined;
            } & {
                ids?: (string[] & string[] & { [K in Exclude<keyof I["value"]["dcIdcScanIdsResult"]["ids"], keyof string[]>]: never; }) | undefined;
            } & { [K_1 in Exclude<keyof I["value"]["dcIdcScanIdsResult"], "ids">]: never; }) | undefined;
            $case: "dcIdcScanIdsResult";
        } & { [K_2 in Exclude<keyof I["value"], "$case" | "dcIdcScanIdsResult">]: never; }) | ({
            dcIdcOpenGrpcClientResult?: {} | undefined;
        } & {
            $case: "dcIdcOpenGrpcClientResult";
        } & {
            dcIdcOpenGrpcClientResult?: ({} & {} & { [K_3 in Exclude<keyof I["value"]["dcIdcOpenGrpcClientResult"], never>]: never; }) | undefined;
            $case: "dcIdcOpenGrpcClientResult";
        } & { [K_4 in Exclude<keyof I["value"], "$case" | "dcIdcOpenGrpcClientResult">]: never; }) | ({
            dcIdcCheckGrpcHealthResult?: {} | undefined;
        } & {
            $case: "dcIdcCheckGrpcHealthResult";
        } & {
            dcIdcCheckGrpcHealthResult?: ({} & {} & { [K_5 in Exclude<keyof I["value"]["dcIdcCheckGrpcHealthResult"], never>]: never; }) | undefined;
            $case: "dcIdcCheckGrpcHealthResult";
        } & { [K_6 in Exclude<keyof I["value"], "$case" | "dcIdcCheckGrpcHealthResult">]: never; }) | ({
            dcIdcStartScreenRecordResult?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "dcIdcStartScreenRecordResult";
        } & {
            dcIdcStartScreenRecordResult?: ({
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
                    } & { [K_7 in Exclude<keyof I["value"]["dcIdcStartScreenRecordResult"]["error"]["details"], string | number>]: never; }) | undefined;
                } & { [K_8 in Exclude<keyof I["value"]["dcIdcStartScreenRecordResult"]["error"], keyof import("../../index").ErrorResult>]: never; }) | undefined;
            } & { [K_9 in Exclude<keyof I["value"]["dcIdcStartScreenRecordResult"], "error">]: never; }) | undefined;
            $case: "dcIdcStartScreenRecordResult";
        } & { [K_10 in Exclude<keyof I["value"], "$case" | "dcIdcStartScreenRecordResult">]: never; }) | ({
            dcIdcStopScreenRecordResult?: {
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
            $case: "dcIdcStopScreenRecordResult";
        } & {
            dcIdcStopScreenRecordResult?: ({
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
                    } & { [K_11 in Exclude<keyof I["value"]["dcIdcStopScreenRecordResult"]["error"]["details"], string | number>]: never; }) | undefined;
                } & { [K_12 in Exclude<keyof I["value"]["dcIdcStopScreenRecordResult"]["error"], keyof import("../../index").ErrorResult>]: never; }) | undefined;
                filePath?: string | undefined;
            } & { [K_13 in Exclude<keyof I["value"]["dcIdcStopScreenRecordResult"], keyof DcIdcStopScreenRecordResult>]: never; }) | undefined;
            $case: "dcIdcStopScreenRecordResult";
        } & { [K_14 in Exclude<keyof I["value"], "$case" | "dcIdcStopScreenRecordResult">]: never; }) | undefined;
    } & { [K_15 in Exclude<keyof I, "value">]: never; }>(object: I): DcIdcResult;
};
