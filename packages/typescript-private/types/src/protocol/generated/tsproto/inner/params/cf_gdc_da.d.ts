import _m0 from 'protobufjs/minimal';
import { CfGdcDaControlParam, CfGdcDaControlResult } from '../types/cf_gdc_da';
export interface CfGdcDaParam {
    seq: number;
    serial: string;
    value?: {
        $case: 'cfGdcDaControlParam';
        cfGdcDaControlParam: CfGdcDaControlParam;
    };
}
export interface CfGdcDaResult {
    seq: number;
    value?: {
        $case: 'cfGdcDaControlResult';
        cfGdcDaControlResult: CfGdcDaControlResult;
    };
}
export interface CfGdcDaParamList {
    params: CfGdcDaParam[];
}
export interface CfGdcDaResultList {
    results: CfGdcDaResult[];
}
export declare const CfGdcDaParam: {
    encode(message: CfGdcDaParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CfGdcDaParam;
    fromJSON(object: any): CfGdcDaParam;
    toJSON(message: CfGdcDaParam): unknown;
    fromPartial<I extends {
        seq?: number | undefined;
        serial?: string | undefined;
        value?: ({
            cfGdcDaControlParam?: {
                control?: {
                    type?: import("../index").DeviceControlType | undefined;
                    text?: string | undefined;
                    metaState?: import("../index").DeviceControlMetaState | undefined;
                    action?: import("../index").DeviceControlAction | undefined;
                    keycode?: import("../index").DeviceControlKeycode | undefined;
                    buttons?: number | undefined;
                    pointerId?: number | undefined;
                    pressure?: number | undefined;
                    position?: {
                        x?: number | undefined;
                        y?: number | undefined;
                        screenWidth?: number | undefined;
                        screenHeight?: number | undefined;
                    } | undefined;
                    hScroll?: number | undefined;
                    vScroll?: number | undefined;
                    copyKey?: import("../index").DeviceControlCopyKey | undefined;
                    paste?: boolean | undefined;
                    repeat?: number | undefined;
                    sequence?: number | undefined;
                    key?: string | undefined;
                    timeStamp?: number | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "cfGdcDaControlParam";
        }) | undefined;
    } & {
        seq?: number | undefined;
        serial?: string | undefined;
        value?: ({
            cfGdcDaControlParam?: {
                control?: {
                    type?: import("../index").DeviceControlType | undefined;
                    text?: string | undefined;
                    metaState?: import("../index").DeviceControlMetaState | undefined;
                    action?: import("../index").DeviceControlAction | undefined;
                    keycode?: import("../index").DeviceControlKeycode | undefined;
                    buttons?: number | undefined;
                    pointerId?: number | undefined;
                    pressure?: number | undefined;
                    position?: {
                        x?: number | undefined;
                        y?: number | undefined;
                        screenWidth?: number | undefined;
                        screenHeight?: number | undefined;
                    } | undefined;
                    hScroll?: number | undefined;
                    vScroll?: number | undefined;
                    copyKey?: import("../index").DeviceControlCopyKey | undefined;
                    paste?: boolean | undefined;
                    repeat?: number | undefined;
                    sequence?: number | undefined;
                    key?: string | undefined;
                    timeStamp?: number | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "cfGdcDaControlParam";
        } & {
            cfGdcDaControlParam?: ({
                control?: {
                    type?: import("../index").DeviceControlType | undefined;
                    text?: string | undefined;
                    metaState?: import("../index").DeviceControlMetaState | undefined;
                    action?: import("../index").DeviceControlAction | undefined;
                    keycode?: import("../index").DeviceControlKeycode | undefined;
                    buttons?: number | undefined;
                    pointerId?: number | undefined;
                    pressure?: number | undefined;
                    position?: {
                        x?: number | undefined;
                        y?: number | undefined;
                        screenWidth?: number | undefined;
                        screenHeight?: number | undefined;
                    } | undefined;
                    hScroll?: number | undefined;
                    vScroll?: number | undefined;
                    copyKey?: import("../index").DeviceControlCopyKey | undefined;
                    paste?: boolean | undefined;
                    repeat?: number | undefined;
                    sequence?: number | undefined;
                    key?: string | undefined;
                    timeStamp?: number | undefined;
                } | undefined;
            } & {
                control?: ({
                    type?: import("../index").DeviceControlType | undefined;
                    text?: string | undefined;
                    metaState?: import("../index").DeviceControlMetaState | undefined;
                    action?: import("../index").DeviceControlAction | undefined;
                    keycode?: import("../index").DeviceControlKeycode | undefined;
                    buttons?: number | undefined;
                    pointerId?: number | undefined;
                    pressure?: number | undefined;
                    position?: {
                        x?: number | undefined;
                        y?: number | undefined;
                        screenWidth?: number | undefined;
                        screenHeight?: number | undefined;
                    } | undefined;
                    hScroll?: number | undefined;
                    vScroll?: number | undefined;
                    copyKey?: import("../index").DeviceControlCopyKey | undefined;
                    paste?: boolean | undefined;
                    repeat?: number | undefined;
                    sequence?: number | undefined;
                    key?: string | undefined;
                    timeStamp?: number | undefined;
                } & {
                    type?: import("../index").DeviceControlType | undefined;
                    text?: string | undefined;
                    metaState?: import("../index").DeviceControlMetaState | undefined;
                    action?: import("../index").DeviceControlAction | undefined;
                    keycode?: import("../index").DeviceControlKeycode | undefined;
                    buttons?: number | undefined;
                    pointerId?: number | undefined;
                    pressure?: number | undefined;
                    position?: ({
                        x?: number | undefined;
                        y?: number | undefined;
                        screenWidth?: number | undefined;
                        screenHeight?: number | undefined;
                    } & {
                        x?: number | undefined;
                        y?: number | undefined;
                        screenWidth?: number | undefined;
                        screenHeight?: number | undefined;
                    } & { [K in Exclude<keyof I["value"]["cfGdcDaControlParam"]["control"]["position"], keyof import("../index").DevicePosition>]: never; }) | undefined;
                    hScroll?: number | undefined;
                    vScroll?: number | undefined;
                    copyKey?: import("../index").DeviceControlCopyKey | undefined;
                    paste?: boolean | undefined;
                    repeat?: number | undefined;
                    sequence?: number | undefined;
                    key?: string | undefined;
                    timeStamp?: number | undefined;
                } & { [K_1 in Exclude<keyof I["value"]["cfGdcDaControlParam"]["control"], keyof import("../index").DeviceControl>]: never; }) | undefined;
            } & { [K_2 in Exclude<keyof I["value"]["cfGdcDaControlParam"], "control">]: never; }) | undefined;
            $case: "cfGdcDaControlParam";
        } & { [K_3 in Exclude<keyof I["value"], "$case" | "cfGdcDaControlParam">]: never; }) | undefined;
    } & { [K_4 in Exclude<keyof I, keyof CfGdcDaParam>]: never; }>(object: I): CfGdcDaParam;
};
export declare const CfGdcDaResult: {
    encode(message: CfGdcDaResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CfGdcDaResult;
    fromJSON(object: any): CfGdcDaResult;
    toJSON(message: CfGdcDaResult): unknown;
    fromPartial<I extends {
        seq?: number | undefined;
        value?: ({
            cfGdcDaControlResult?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "cfGdcDaControlResult";
        }) | undefined;
    } & {
        seq?: number | undefined;
        value?: ({
            cfGdcDaControlResult?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "cfGdcDaControlResult";
        } & {
            cfGdcDaControlResult?: ({
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
                    } & { [K in Exclude<keyof I["value"]["cfGdcDaControlResult"]["error"]["details"], string | number>]: never; }) | undefined;
                } & { [K_1 in Exclude<keyof I["value"]["cfGdcDaControlResult"]["error"], keyof import("../../index").ErrorResult>]: never; }) | undefined;
            } & { [K_2 in Exclude<keyof I["value"]["cfGdcDaControlResult"], "error">]: never; }) | undefined;
            $case: "cfGdcDaControlResult";
        } & { [K_3 in Exclude<keyof I["value"], "$case" | "cfGdcDaControlResult">]: never; }) | undefined;
    } & { [K_4 in Exclude<keyof I, keyof CfGdcDaResult>]: never; }>(object: I): CfGdcDaResult;
};
export declare const CfGdcDaParamList: {
    encode(message: CfGdcDaParamList, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CfGdcDaParamList;
    fromJSON(object: any): CfGdcDaParamList;
    toJSON(message: CfGdcDaParamList): unknown;
    fromPartial<I extends {
        params?: {
            seq?: number | undefined;
            serial?: string | undefined;
            value?: ({
                cfGdcDaControlParam?: {
                    control?: {
                        type?: import("../index").DeviceControlType | undefined;
                        text?: string | undefined;
                        metaState?: import("../index").DeviceControlMetaState | undefined;
                        action?: import("../index").DeviceControlAction | undefined;
                        keycode?: import("../index").DeviceControlKeycode | undefined;
                        buttons?: number | undefined;
                        pointerId?: number | undefined;
                        pressure?: number | undefined;
                        position?: {
                            x?: number | undefined;
                            y?: number | undefined;
                            screenWidth?: number | undefined;
                            screenHeight?: number | undefined;
                        } | undefined;
                        hScroll?: number | undefined;
                        vScroll?: number | undefined;
                        copyKey?: import("../index").DeviceControlCopyKey | undefined;
                        paste?: boolean | undefined;
                        repeat?: number | undefined;
                        sequence?: number | undefined;
                        key?: string | undefined;
                        timeStamp?: number | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "cfGdcDaControlParam";
            }) | undefined;
        }[] | undefined;
    } & {
        params?: ({
            seq?: number | undefined;
            serial?: string | undefined;
            value?: ({
                cfGdcDaControlParam?: {
                    control?: {
                        type?: import("../index").DeviceControlType | undefined;
                        text?: string | undefined;
                        metaState?: import("../index").DeviceControlMetaState | undefined;
                        action?: import("../index").DeviceControlAction | undefined;
                        keycode?: import("../index").DeviceControlKeycode | undefined;
                        buttons?: number | undefined;
                        pointerId?: number | undefined;
                        pressure?: number | undefined;
                        position?: {
                            x?: number | undefined;
                            y?: number | undefined;
                            screenWidth?: number | undefined;
                            screenHeight?: number | undefined;
                        } | undefined;
                        hScroll?: number | undefined;
                        vScroll?: number | undefined;
                        copyKey?: import("../index").DeviceControlCopyKey | undefined;
                        paste?: boolean | undefined;
                        repeat?: number | undefined;
                        sequence?: number | undefined;
                        key?: string | undefined;
                        timeStamp?: number | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "cfGdcDaControlParam";
            }) | undefined;
        }[] & ({
            seq?: number | undefined;
            serial?: string | undefined;
            value?: ({
                cfGdcDaControlParam?: {
                    control?: {
                        type?: import("../index").DeviceControlType | undefined;
                        text?: string | undefined;
                        metaState?: import("../index").DeviceControlMetaState | undefined;
                        action?: import("../index").DeviceControlAction | undefined;
                        keycode?: import("../index").DeviceControlKeycode | undefined;
                        buttons?: number | undefined;
                        pointerId?: number | undefined;
                        pressure?: number | undefined;
                        position?: {
                            x?: number | undefined;
                            y?: number | undefined;
                            screenWidth?: number | undefined;
                            screenHeight?: number | undefined;
                        } | undefined;
                        hScroll?: number | undefined;
                        vScroll?: number | undefined;
                        copyKey?: import("../index").DeviceControlCopyKey | undefined;
                        paste?: boolean | undefined;
                        repeat?: number | undefined;
                        sequence?: number | undefined;
                        key?: string | undefined;
                        timeStamp?: number | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "cfGdcDaControlParam";
            }) | undefined;
        } & {
            seq?: number | undefined;
            serial?: string | undefined;
            value?: ({
                cfGdcDaControlParam?: {
                    control?: {
                        type?: import("../index").DeviceControlType | undefined;
                        text?: string | undefined;
                        metaState?: import("../index").DeviceControlMetaState | undefined;
                        action?: import("../index").DeviceControlAction | undefined;
                        keycode?: import("../index").DeviceControlKeycode | undefined;
                        buttons?: number | undefined;
                        pointerId?: number | undefined;
                        pressure?: number | undefined;
                        position?: {
                            x?: number | undefined;
                            y?: number | undefined;
                            screenWidth?: number | undefined;
                            screenHeight?: number | undefined;
                        } | undefined;
                        hScroll?: number | undefined;
                        vScroll?: number | undefined;
                        copyKey?: import("../index").DeviceControlCopyKey | undefined;
                        paste?: boolean | undefined;
                        repeat?: number | undefined;
                        sequence?: number | undefined;
                        key?: string | undefined;
                        timeStamp?: number | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "cfGdcDaControlParam";
            } & {
                cfGdcDaControlParam?: ({
                    control?: {
                        type?: import("../index").DeviceControlType | undefined;
                        text?: string | undefined;
                        metaState?: import("../index").DeviceControlMetaState | undefined;
                        action?: import("../index").DeviceControlAction | undefined;
                        keycode?: import("../index").DeviceControlKeycode | undefined;
                        buttons?: number | undefined;
                        pointerId?: number | undefined;
                        pressure?: number | undefined;
                        position?: {
                            x?: number | undefined;
                            y?: number | undefined;
                            screenWidth?: number | undefined;
                            screenHeight?: number | undefined;
                        } | undefined;
                        hScroll?: number | undefined;
                        vScroll?: number | undefined;
                        copyKey?: import("../index").DeviceControlCopyKey | undefined;
                        paste?: boolean | undefined;
                        repeat?: number | undefined;
                        sequence?: number | undefined;
                        key?: string | undefined;
                        timeStamp?: number | undefined;
                    } | undefined;
                } & {
                    control?: ({
                        type?: import("../index").DeviceControlType | undefined;
                        text?: string | undefined;
                        metaState?: import("../index").DeviceControlMetaState | undefined;
                        action?: import("../index").DeviceControlAction | undefined;
                        keycode?: import("../index").DeviceControlKeycode | undefined;
                        buttons?: number | undefined;
                        pointerId?: number | undefined;
                        pressure?: number | undefined;
                        position?: {
                            x?: number | undefined;
                            y?: number | undefined;
                            screenWidth?: number | undefined;
                            screenHeight?: number | undefined;
                        } | undefined;
                        hScroll?: number | undefined;
                        vScroll?: number | undefined;
                        copyKey?: import("../index").DeviceControlCopyKey | undefined;
                        paste?: boolean | undefined;
                        repeat?: number | undefined;
                        sequence?: number | undefined;
                        key?: string | undefined;
                        timeStamp?: number | undefined;
                    } & {
                        type?: import("../index").DeviceControlType | undefined;
                        text?: string | undefined;
                        metaState?: import("../index").DeviceControlMetaState | undefined;
                        action?: import("../index").DeviceControlAction | undefined;
                        keycode?: import("../index").DeviceControlKeycode | undefined;
                        buttons?: number | undefined;
                        pointerId?: number | undefined;
                        pressure?: number | undefined;
                        position?: ({
                            x?: number | undefined;
                            y?: number | undefined;
                            screenWidth?: number | undefined;
                            screenHeight?: number | undefined;
                        } & {
                            x?: number | undefined;
                            y?: number | undefined;
                            screenWidth?: number | undefined;
                            screenHeight?: number | undefined;
                        } & { [K in Exclude<keyof I["params"][number]["value"]["cfGdcDaControlParam"]["control"]["position"], keyof import("../index").DevicePosition>]: never; }) | undefined;
                        hScroll?: number | undefined;
                        vScroll?: number | undefined;
                        copyKey?: import("../index").DeviceControlCopyKey | undefined;
                        paste?: boolean | undefined;
                        repeat?: number | undefined;
                        sequence?: number | undefined;
                        key?: string | undefined;
                        timeStamp?: number | undefined;
                    } & { [K_1 in Exclude<keyof I["params"][number]["value"]["cfGdcDaControlParam"]["control"], keyof import("../index").DeviceControl>]: never; }) | undefined;
                } & { [K_2 in Exclude<keyof I["params"][number]["value"]["cfGdcDaControlParam"], "control">]: never; }) | undefined;
                $case: "cfGdcDaControlParam";
            } & { [K_3 in Exclude<keyof I["params"][number]["value"], "$case" | "cfGdcDaControlParam">]: never; }) | undefined;
        } & { [K_4 in Exclude<keyof I["params"][number], keyof CfGdcDaParam>]: never; })[] & { [K_5 in Exclude<keyof I["params"], keyof {
            seq?: number | undefined;
            serial?: string | undefined;
            value?: ({
                cfGdcDaControlParam?: {
                    control?: {
                        type?: import("../index").DeviceControlType | undefined;
                        text?: string | undefined;
                        metaState?: import("../index").DeviceControlMetaState | undefined;
                        action?: import("../index").DeviceControlAction | undefined;
                        keycode?: import("../index").DeviceControlKeycode | undefined;
                        buttons?: number | undefined;
                        pointerId?: number | undefined;
                        pressure?: number | undefined;
                        position?: {
                            x?: number | undefined;
                            y?: number | undefined;
                            screenWidth?: number | undefined;
                            screenHeight?: number | undefined;
                        } | undefined;
                        hScroll?: number | undefined;
                        vScroll?: number | undefined;
                        copyKey?: import("../index").DeviceControlCopyKey | undefined;
                        paste?: boolean | undefined;
                        repeat?: number | undefined;
                        sequence?: number | undefined;
                        key?: string | undefined;
                        timeStamp?: number | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "cfGdcDaControlParam";
            }) | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_6 in Exclude<keyof I, "params">]: never; }>(object: I): CfGdcDaParamList;
};
export declare const CfGdcDaResultList: {
    encode(message: CfGdcDaResultList, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CfGdcDaResultList;
    fromJSON(object: any): CfGdcDaResultList;
    toJSON(message: CfGdcDaResultList): unknown;
    fromPartial<I extends {
        results?: {
            seq?: number | undefined;
            value?: ({
                cfGdcDaControlResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "cfGdcDaControlResult";
            }) | undefined;
        }[] | undefined;
    } & {
        results?: ({
            seq?: number | undefined;
            value?: ({
                cfGdcDaControlResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "cfGdcDaControlResult";
            }) | undefined;
        }[] & ({
            seq?: number | undefined;
            value?: ({
                cfGdcDaControlResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "cfGdcDaControlResult";
            }) | undefined;
        } & {
            seq?: number | undefined;
            value?: ({
                cfGdcDaControlResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "cfGdcDaControlResult";
            } & {
                cfGdcDaControlResult?: ({
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
                        } & { [K in Exclude<keyof I["results"][number]["value"]["cfGdcDaControlResult"]["error"]["details"], string | number>]: never; }) | undefined;
                    } & { [K_1 in Exclude<keyof I["results"][number]["value"]["cfGdcDaControlResult"]["error"], keyof import("../../index").ErrorResult>]: never; }) | undefined;
                } & { [K_2 in Exclude<keyof I["results"][number]["value"]["cfGdcDaControlResult"], "error">]: never; }) | undefined;
                $case: "cfGdcDaControlResult";
            } & { [K_3 in Exclude<keyof I["results"][number]["value"], "$case" | "cfGdcDaControlResult">]: never; }) | undefined;
        } & { [K_4 in Exclude<keyof I["results"][number], keyof CfGdcDaResult>]: never; })[] & { [K_5 in Exclude<keyof I["results"], keyof {
            seq?: number | undefined;
            value?: ({
                cfGdcDaControlResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "cfGdcDaControlResult";
            }) | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_6 in Exclude<keyof I, "results">]: never; }>(object: I): CfGdcDaResultList;
};
