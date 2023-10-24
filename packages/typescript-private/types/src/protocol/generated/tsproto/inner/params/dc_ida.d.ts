import _m0 from 'protobufjs/minimal';
import { CfGdcDaControlParam, CfGdcDaControlResult } from '../types/cf_gdc_da';
import { DcIdaGetSystemInfoParam, DcIdaGetSystemInfoResult, DcIdaIsPortListeningParam, DcIdaIsPortListeningResult, DcIdaQueryProfileParam, DcIdaQueryProfileResult, DcIdaRunAppParam, DcIdaRunAppResult } from '../types/dc_ida';
export interface DcIdaParam {
    seq: number;
    value?: {
        $case: 'dcIdaRunappParam';
        dcIdaRunappParam: DcIdaRunAppParam;
    } | {
        $case: 'dcIdaGetSystemInfoParam';
        dcIdaGetSystemInfoParam: DcIdaGetSystemInfoParam;
    } | {
        $case: 'dcIdaIsPortListeningParam';
        dcIdaIsPortListeningParam: DcIdaIsPortListeningParam;
    } | {
        $case: 'dcIdaQueryProfileParam';
        dcIdaQueryProfileParam: DcIdaQueryProfileParam;
    } | {
        $case: 'dcGdcDaControlParam';
        dcGdcDaControlParam: CfGdcDaControlParam;
    };
}
export interface DcIdaResult {
    seq: number;
    value?: {
        $case: 'dcIdaRunappResult';
        dcIdaRunappResult: DcIdaRunAppResult;
    } | {
        $case: 'dcIdaGetSystemInfoResult';
        dcIdaGetSystemInfoResult: DcIdaGetSystemInfoResult;
    } | {
        $case: 'dcIdaIsPortListeningResult';
        dcIdaIsPortListeningResult: DcIdaIsPortListeningResult;
    } | {
        $case: 'dcIdaQueryProfileResult';
        dcIdaQueryProfileResult: DcIdaQueryProfileResult;
    } | {
        $case: 'dcGdcDaControlResult';
        dcGdcDaControlResult: CfGdcDaControlResult;
    };
}
export interface DcIdaParamList {
    params: DcIdaParam[];
}
export interface DcIdaResultList {
    results: DcIdaResult[];
}
export declare const DcIdaParam: {
    encode(message: DcIdaParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaParam;
    fromJSON(object: any): DcIdaParam;
    toJSON(message: DcIdaParam): unknown;
    fromPartial<I extends {
        seq?: number | undefined;
        value?: ({
            dcIdaRunappParam?: {
                appPath?: string | undefined;
                installedAppNames?: string[] | undefined;
                bundleId?: string | undefined;
            } | undefined;
        } & {
            $case: "dcIdaRunappParam";
        }) | ({
            dcIdaGetSystemInfoParam?: {} | undefined;
        } & {
            $case: "dcIdaGetSystemInfoParam";
        }) | ({
            dcIdaIsPortListeningParam?: {
                port?: number | undefined;
            } | undefined;
        } & {
            $case: "dcIdaIsPortListeningParam";
        }) | ({
            dcIdaQueryProfileParam?: {
                profileMethods?: {
                    kind?: import("../../index").ProfileMethodKind | undefined;
                    name?: string | undefined;
                }[] | undefined;
            } | undefined;
        } & {
            $case: "dcIdaQueryProfileParam";
        }) | ({
            dcGdcDaControlParam?: {
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
            $case: "dcGdcDaControlParam";
        }) | undefined;
    } & {
        seq?: number | undefined;
        value?: ({
            dcIdaRunappParam?: {
                appPath?: string | undefined;
                installedAppNames?: string[] | undefined;
                bundleId?: string | undefined;
            } | undefined;
        } & {
            $case: "dcIdaRunappParam";
        } & {
            dcIdaRunappParam?: ({
                appPath?: string | undefined;
                installedAppNames?: string[] | undefined;
                bundleId?: string | undefined;
            } & {
                appPath?: string | undefined;
                installedAppNames?: (string[] & string[] & { [K in Exclude<keyof I["value"]["dcIdaRunappParam"]["installedAppNames"], keyof string[]>]: never; }) | undefined;
                bundleId?: string | undefined;
            } & { [K_1 in Exclude<keyof I["value"]["dcIdaRunappParam"], keyof DcIdaRunAppParam>]: never; }) | undefined;
            $case: "dcIdaRunappParam";
        } & { [K_2 in Exclude<keyof I["value"], "$case" | "dcIdaRunappParam">]: never; }) | ({
            dcIdaGetSystemInfoParam?: {} | undefined;
        } & {
            $case: "dcIdaGetSystemInfoParam";
        } & {
            dcIdaGetSystemInfoParam?: ({} & {} & { [K_3 in Exclude<keyof I["value"]["dcIdaGetSystemInfoParam"], never>]: never; }) | undefined;
            $case: "dcIdaGetSystemInfoParam";
        } & { [K_4 in Exclude<keyof I["value"], "$case" | "dcIdaGetSystemInfoParam">]: never; }) | ({
            dcIdaIsPortListeningParam?: {
                port?: number | undefined;
            } | undefined;
        } & {
            $case: "dcIdaIsPortListeningParam";
        } & {
            dcIdaIsPortListeningParam?: ({
                port?: number | undefined;
            } & {
                port?: number | undefined;
            } & { [K_5 in Exclude<keyof I["value"]["dcIdaIsPortListeningParam"], "port">]: never; }) | undefined;
            $case: "dcIdaIsPortListeningParam";
        } & { [K_6 in Exclude<keyof I["value"], "$case" | "dcIdaIsPortListeningParam">]: never; }) | ({
            dcIdaQueryProfileParam?: {
                profileMethods?: {
                    kind?: import("../../index").ProfileMethodKind | undefined;
                    name?: string | undefined;
                }[] | undefined;
            } | undefined;
        } & {
            $case: "dcIdaQueryProfileParam";
        } & {
            dcIdaQueryProfileParam?: ({
                profileMethods?: {
                    kind?: import("../../index").ProfileMethodKind | undefined;
                    name?: string | undefined;
                }[] | undefined;
            } & {
                profileMethods?: ({
                    kind?: import("../../index").ProfileMethodKind | undefined;
                    name?: string | undefined;
                }[] & ({
                    kind?: import("../../index").ProfileMethodKind | undefined;
                    name?: string | undefined;
                } & {
                    kind?: import("../../index").ProfileMethodKind | undefined;
                    name?: string | undefined;
                } & { [K_7 in Exclude<keyof I["value"]["dcIdaQueryProfileParam"]["profileMethods"][number], keyof import("../../index").ProfileMethod>]: never; })[] & { [K_8 in Exclude<keyof I["value"]["dcIdaQueryProfileParam"]["profileMethods"], keyof {
                    kind?: import("../../index").ProfileMethodKind | undefined;
                    name?: string | undefined;
                }[]>]: never; }) | undefined;
            } & { [K_9 in Exclude<keyof I["value"]["dcIdaQueryProfileParam"], "profileMethods">]: never; }) | undefined;
            $case: "dcIdaQueryProfileParam";
        } & { [K_10 in Exclude<keyof I["value"], "$case" | "dcIdaQueryProfileParam">]: never; }) | ({
            dcGdcDaControlParam?: {
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
            $case: "dcGdcDaControlParam";
        } & {
            dcGdcDaControlParam?: ({
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
                    } & { [K_11 in Exclude<keyof I["value"]["dcGdcDaControlParam"]["control"]["position"], keyof import("../index").DevicePosition>]: never; }) | undefined;
                    hScroll?: number | undefined;
                    vScroll?: number | undefined;
                    copyKey?: import("../index").DeviceControlCopyKey | undefined;
                    paste?: boolean | undefined;
                    repeat?: number | undefined;
                    sequence?: number | undefined;
                    key?: string | undefined;
                    timeStamp?: number | undefined;
                } & { [K_12 in Exclude<keyof I["value"]["dcGdcDaControlParam"]["control"], keyof import("../index").DeviceControl>]: never; }) | undefined;
            } & { [K_13 in Exclude<keyof I["value"]["dcGdcDaControlParam"], "control">]: never; }) | undefined;
            $case: "dcGdcDaControlParam";
        } & { [K_14 in Exclude<keyof I["value"], "$case" | "dcGdcDaControlParam">]: never; }) | undefined;
    } & { [K_15 in Exclude<keyof I, keyof DcIdaParam>]: never; }>(object: I): DcIdaParam;
};
export declare const DcIdaResult: {
    encode(message: DcIdaResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaResult;
    fromJSON(object: any): DcIdaResult;
    toJSON(message: DcIdaResult): unknown;
    fromPartial<I extends {
        seq?: number | undefined;
        value?: ({
            dcIdaRunappResult?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "dcIdaRunappResult";
        }) | ({
            dcIdaGetSystemInfoResult?: {
                screenWidth?: number | undefined;
                screenHeight?: number | undefined;
            } | undefined;
        } & {
            $case: "dcIdaGetSystemInfoResult";
        }) | ({
            dcIdaIsPortListeningResult?: {
                isListening?: boolean | undefined;
            } | undefined;
        } & {
            $case: "dcIdaIsPortListeningResult";
        }) | ({
            dcIdaQueryProfileResult?: {
                info?: {
                    platform?: import("../../index").Platform | undefined;
                    localTimeStamp?: Date | undefined;
                    cpues?: {
                        name?: string | undefined;
                        currentLoad?: number | undefined;
                        currentLoadUser?: number | undefined;
                        currentLoadSystem?: number | undefined;
                        currentLoadNice?: number | undefined;
                        currentLoadIdle?: number | undefined;
                        currentLoadIrq?: number | undefined;
                        currentLoadCpu?: number | undefined;
                    }[] | undefined;
                    cpufreqs?: {
                        idx?: number | undefined;
                        min?: number | undefined;
                        cur?: number | undefined;
                        max?: number | undefined;
                    }[] | undefined;
                    gpues?: {
                        desc?: string | undefined;
                    }[] | undefined;
                    mems?: {
                        name?: string | undefined;
                        total?: number | undefined;
                        free?: number | undefined;
                        used?: number | undefined;
                        active?: number | undefined;
                        available?: number | undefined;
                        swaptotal?: number | undefined;
                        swapused?: number | undefined;
                        swapfree?: number | undefined;
                        isLow?: boolean | undefined;
                    }[] | undefined;
                    fses?: {
                        name?: string | undefined;
                        type?: string | undefined;
                        mount?: string | undefined;
                        size?: number | undefined;
                        used?: number | undefined;
                        available?: number | undefined;
                        use?: number | undefined;
                        readsCompleted?: number | undefined;
                        timeSpentReadMs?: number | undefined;
                        writesCompleted?: number | undefined;
                        timeSpentWriteMs?: number | undefined;
                    }[] | undefined;
                    nets?: {
                        name?: string | undefined;
                        mobileRxbytes?: number | undefined;
                        mobileTxbytes?: number | undefined;
                        wifiRxbytes?: number | undefined;
                        wifiTxbytes?: number | undefined;
                        totalRxbytes?: number | undefined;
                        totalTxbytes?: number | undefined;
                    }[] | undefined;
                    displays?: {
                        name?: string | undefined;
                        isScreenOn?: boolean | undefined;
                        error?: string | undefined;
                    }[] | undefined;
                    batteries?: {
                        name?: string | undefined;
                        percent?: number | undefined;
                    }[] | undefined;
                    processes?: {
                        name?: string | undefined;
                        pid?: number | undefined;
                        isForeground?: boolean | undefined;
                        cpues?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            writeBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            sendBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                    }[] | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "dcIdaQueryProfileResult";
        }) | ({
            dcGdcDaControlResult?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "dcGdcDaControlResult";
        }) | undefined;
    } & {
        seq?: number | undefined;
        value?: ({
            dcIdaRunappResult?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "dcIdaRunappResult";
        } & {
            dcIdaRunappResult?: ({
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
                    } & { [K in Exclude<keyof I["value"]["dcIdaRunappResult"]["error"]["details"], string | number>]: never; }) | undefined;
                } & { [K_1 in Exclude<keyof I["value"]["dcIdaRunappResult"]["error"], keyof import("../../index").ErrorResult>]: never; }) | undefined;
            } & { [K_2 in Exclude<keyof I["value"]["dcIdaRunappResult"], "error">]: never; }) | undefined;
            $case: "dcIdaRunappResult";
        } & { [K_3 in Exclude<keyof I["value"], "$case" | "dcIdaRunappResult">]: never; }) | ({
            dcIdaGetSystemInfoResult?: {
                screenWidth?: number | undefined;
                screenHeight?: number | undefined;
            } | undefined;
        } & {
            $case: "dcIdaGetSystemInfoResult";
        } & {
            dcIdaGetSystemInfoResult?: ({
                screenWidth?: number | undefined;
                screenHeight?: number | undefined;
            } & {
                screenWidth?: number | undefined;
                screenHeight?: number | undefined;
            } & { [K_4 in Exclude<keyof I["value"]["dcIdaGetSystemInfoResult"], keyof DcIdaGetSystemInfoResult>]: never; }) | undefined;
            $case: "dcIdaGetSystemInfoResult";
        } & { [K_5 in Exclude<keyof I["value"], "$case" | "dcIdaGetSystemInfoResult">]: never; }) | ({
            dcIdaIsPortListeningResult?: {
                isListening?: boolean | undefined;
            } | undefined;
        } & {
            $case: "dcIdaIsPortListeningResult";
        } & {
            dcIdaIsPortListeningResult?: ({
                isListening?: boolean | undefined;
            } & {
                isListening?: boolean | undefined;
            } & { [K_6 in Exclude<keyof I["value"]["dcIdaIsPortListeningResult"], "isListening">]: never; }) | undefined;
            $case: "dcIdaIsPortListeningResult";
        } & { [K_7 in Exclude<keyof I["value"], "$case" | "dcIdaIsPortListeningResult">]: never; }) | ({
            dcIdaQueryProfileResult?: {
                info?: {
                    platform?: import("../../index").Platform | undefined;
                    localTimeStamp?: Date | undefined;
                    cpues?: {
                        name?: string | undefined;
                        currentLoad?: number | undefined;
                        currentLoadUser?: number | undefined;
                        currentLoadSystem?: number | undefined;
                        currentLoadNice?: number | undefined;
                        currentLoadIdle?: number | undefined;
                        currentLoadIrq?: number | undefined;
                        currentLoadCpu?: number | undefined;
                    }[] | undefined;
                    cpufreqs?: {
                        idx?: number | undefined;
                        min?: number | undefined;
                        cur?: number | undefined;
                        max?: number | undefined;
                    }[] | undefined;
                    gpues?: {
                        desc?: string | undefined;
                    }[] | undefined;
                    mems?: {
                        name?: string | undefined;
                        total?: number | undefined;
                        free?: number | undefined;
                        used?: number | undefined;
                        active?: number | undefined;
                        available?: number | undefined;
                        swaptotal?: number | undefined;
                        swapused?: number | undefined;
                        swapfree?: number | undefined;
                        isLow?: boolean | undefined;
                    }[] | undefined;
                    fses?: {
                        name?: string | undefined;
                        type?: string | undefined;
                        mount?: string | undefined;
                        size?: number | undefined;
                        used?: number | undefined;
                        available?: number | undefined;
                        use?: number | undefined;
                        readsCompleted?: number | undefined;
                        timeSpentReadMs?: number | undefined;
                        writesCompleted?: number | undefined;
                        timeSpentWriteMs?: number | undefined;
                    }[] | undefined;
                    nets?: {
                        name?: string | undefined;
                        mobileRxbytes?: number | undefined;
                        mobileTxbytes?: number | undefined;
                        wifiRxbytes?: number | undefined;
                        wifiTxbytes?: number | undefined;
                        totalRxbytes?: number | undefined;
                        totalTxbytes?: number | undefined;
                    }[] | undefined;
                    displays?: {
                        name?: string | undefined;
                        isScreenOn?: boolean | undefined;
                        error?: string | undefined;
                    }[] | undefined;
                    batteries?: {
                        name?: string | undefined;
                        percent?: number | undefined;
                    }[] | undefined;
                    processes?: {
                        name?: string | undefined;
                        pid?: number | undefined;
                        isForeground?: boolean | undefined;
                        cpues?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            writeBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            sendBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                    }[] | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "dcIdaQueryProfileResult";
        } & {
            dcIdaQueryProfileResult?: ({
                info?: {
                    platform?: import("../../index").Platform | undefined;
                    localTimeStamp?: Date | undefined;
                    cpues?: {
                        name?: string | undefined;
                        currentLoad?: number | undefined;
                        currentLoadUser?: number | undefined;
                        currentLoadSystem?: number | undefined;
                        currentLoadNice?: number | undefined;
                        currentLoadIdle?: number | undefined;
                        currentLoadIrq?: number | undefined;
                        currentLoadCpu?: number | undefined;
                    }[] | undefined;
                    cpufreqs?: {
                        idx?: number | undefined;
                        min?: number | undefined;
                        cur?: number | undefined;
                        max?: number | undefined;
                    }[] | undefined;
                    gpues?: {
                        desc?: string | undefined;
                    }[] | undefined;
                    mems?: {
                        name?: string | undefined;
                        total?: number | undefined;
                        free?: number | undefined;
                        used?: number | undefined;
                        active?: number | undefined;
                        available?: number | undefined;
                        swaptotal?: number | undefined;
                        swapused?: number | undefined;
                        swapfree?: number | undefined;
                        isLow?: boolean | undefined;
                    }[] | undefined;
                    fses?: {
                        name?: string | undefined;
                        type?: string | undefined;
                        mount?: string | undefined;
                        size?: number | undefined;
                        used?: number | undefined;
                        available?: number | undefined;
                        use?: number | undefined;
                        readsCompleted?: number | undefined;
                        timeSpentReadMs?: number | undefined;
                        writesCompleted?: number | undefined;
                        timeSpentWriteMs?: number | undefined;
                    }[] | undefined;
                    nets?: {
                        name?: string | undefined;
                        mobileRxbytes?: number | undefined;
                        mobileTxbytes?: number | undefined;
                        wifiRxbytes?: number | undefined;
                        wifiTxbytes?: number | undefined;
                        totalRxbytes?: number | undefined;
                        totalTxbytes?: number | undefined;
                    }[] | undefined;
                    displays?: {
                        name?: string | undefined;
                        isScreenOn?: boolean | undefined;
                        error?: string | undefined;
                    }[] | undefined;
                    batteries?: {
                        name?: string | undefined;
                        percent?: number | undefined;
                    }[] | undefined;
                    processes?: {
                        name?: string | undefined;
                        pid?: number | undefined;
                        isForeground?: boolean | undefined;
                        cpues?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            writeBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            sendBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                info?: ({
                    platform?: import("../../index").Platform | undefined;
                    localTimeStamp?: Date | undefined;
                    cpues?: {
                        name?: string | undefined;
                        currentLoad?: number | undefined;
                        currentLoadUser?: number | undefined;
                        currentLoadSystem?: number | undefined;
                        currentLoadNice?: number | undefined;
                        currentLoadIdle?: number | undefined;
                        currentLoadIrq?: number | undefined;
                        currentLoadCpu?: number | undefined;
                    }[] | undefined;
                    cpufreqs?: {
                        idx?: number | undefined;
                        min?: number | undefined;
                        cur?: number | undefined;
                        max?: number | undefined;
                    }[] | undefined;
                    gpues?: {
                        desc?: string | undefined;
                    }[] | undefined;
                    mems?: {
                        name?: string | undefined;
                        total?: number | undefined;
                        free?: number | undefined;
                        used?: number | undefined;
                        active?: number | undefined;
                        available?: number | undefined;
                        swaptotal?: number | undefined;
                        swapused?: number | undefined;
                        swapfree?: number | undefined;
                        isLow?: boolean | undefined;
                    }[] | undefined;
                    fses?: {
                        name?: string | undefined;
                        type?: string | undefined;
                        mount?: string | undefined;
                        size?: number | undefined;
                        used?: number | undefined;
                        available?: number | undefined;
                        use?: number | undefined;
                        readsCompleted?: number | undefined;
                        timeSpentReadMs?: number | undefined;
                        writesCompleted?: number | undefined;
                        timeSpentWriteMs?: number | undefined;
                    }[] | undefined;
                    nets?: {
                        name?: string | undefined;
                        mobileRxbytes?: number | undefined;
                        mobileTxbytes?: number | undefined;
                        wifiRxbytes?: number | undefined;
                        wifiTxbytes?: number | undefined;
                        totalRxbytes?: number | undefined;
                        totalTxbytes?: number | undefined;
                    }[] | undefined;
                    displays?: {
                        name?: string | undefined;
                        isScreenOn?: boolean | undefined;
                        error?: string | undefined;
                    }[] | undefined;
                    batteries?: {
                        name?: string | undefined;
                        percent?: number | undefined;
                    }[] | undefined;
                    processes?: {
                        name?: string | undefined;
                        pid?: number | undefined;
                        isForeground?: boolean | undefined;
                        cpues?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            writeBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            sendBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                    }[] | undefined;
                } & {
                    platform?: import("../../index").Platform | undefined;
                    localTimeStamp?: Date | undefined;
                    cpues?: ({
                        name?: string | undefined;
                        currentLoad?: number | undefined;
                        currentLoadUser?: number | undefined;
                        currentLoadSystem?: number | undefined;
                        currentLoadNice?: number | undefined;
                        currentLoadIdle?: number | undefined;
                        currentLoadIrq?: number | undefined;
                        currentLoadCpu?: number | undefined;
                    }[] & ({
                        name?: string | undefined;
                        currentLoad?: number | undefined;
                        currentLoadUser?: number | undefined;
                        currentLoadSystem?: number | undefined;
                        currentLoadNice?: number | undefined;
                        currentLoadIdle?: number | undefined;
                        currentLoadIrq?: number | undefined;
                        currentLoadCpu?: number | undefined;
                    } & {
                        name?: string | undefined;
                        currentLoad?: number | undefined;
                        currentLoadUser?: number | undefined;
                        currentLoadSystem?: number | undefined;
                        currentLoadNice?: number | undefined;
                        currentLoadIdle?: number | undefined;
                        currentLoadIrq?: number | undefined;
                        currentLoadCpu?: number | undefined;
                    } & { [K_8 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["cpues"][number], keyof import("../../index").RuntimeInfoCpu>]: never; })[] & { [K_9 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["cpues"], keyof {
                        name?: string | undefined;
                        currentLoad?: number | undefined;
                        currentLoadUser?: number | undefined;
                        currentLoadSystem?: number | undefined;
                        currentLoadNice?: number | undefined;
                        currentLoadIdle?: number | undefined;
                        currentLoadIrq?: number | undefined;
                        currentLoadCpu?: number | undefined;
                    }[]>]: never; }) | undefined;
                    cpufreqs?: ({
                        idx?: number | undefined;
                        min?: number | undefined;
                        cur?: number | undefined;
                        max?: number | undefined;
                    }[] & ({
                        idx?: number | undefined;
                        min?: number | undefined;
                        cur?: number | undefined;
                        max?: number | undefined;
                    } & {
                        idx?: number | undefined;
                        min?: number | undefined;
                        cur?: number | undefined;
                        max?: number | undefined;
                    } & { [K_10 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["cpufreqs"][number], keyof import("../../index").RuntimeInfoCpuFreq>]: never; })[] & { [K_11 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["cpufreqs"], keyof {
                        idx?: number | undefined;
                        min?: number | undefined;
                        cur?: number | undefined;
                        max?: number | undefined;
                    }[]>]: never; }) | undefined;
                    gpues?: ({
                        desc?: string | undefined;
                    }[] & ({
                        desc?: string | undefined;
                    } & {
                        desc?: string | undefined;
                    } & { [K_12 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["gpues"][number], "desc">]: never; })[] & { [K_13 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["gpues"], keyof {
                        desc?: string | undefined;
                    }[]>]: never; }) | undefined;
                    mems?: ({
                        name?: string | undefined;
                        total?: number | undefined;
                        free?: number | undefined;
                        used?: number | undefined;
                        active?: number | undefined;
                        available?: number | undefined;
                        swaptotal?: number | undefined;
                        swapused?: number | undefined;
                        swapfree?: number | undefined;
                        isLow?: boolean | undefined;
                    }[] & ({
                        name?: string | undefined;
                        total?: number | undefined;
                        free?: number | undefined;
                        used?: number | undefined;
                        active?: number | undefined;
                        available?: number | undefined;
                        swaptotal?: number | undefined;
                        swapused?: number | undefined;
                        swapfree?: number | undefined;
                        isLow?: boolean | undefined;
                    } & {
                        name?: string | undefined;
                        total?: number | undefined;
                        free?: number | undefined;
                        used?: number | undefined;
                        active?: number | undefined;
                        available?: number | undefined;
                        swaptotal?: number | undefined;
                        swapused?: number | undefined;
                        swapfree?: number | undefined;
                        isLow?: boolean | undefined;
                    } & { [K_14 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["mems"][number], keyof import("../../index").RuntimeInfoMem>]: never; })[] & { [K_15 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["mems"], keyof {
                        name?: string | undefined;
                        total?: number | undefined;
                        free?: number | undefined;
                        used?: number | undefined;
                        active?: number | undefined;
                        available?: number | undefined;
                        swaptotal?: number | undefined;
                        swapused?: number | undefined;
                        swapfree?: number | undefined;
                        isLow?: boolean | undefined;
                    }[]>]: never; }) | undefined;
                    fses?: ({
                        name?: string | undefined;
                        type?: string | undefined;
                        mount?: string | undefined;
                        size?: number | undefined;
                        used?: number | undefined;
                        available?: number | undefined;
                        use?: number | undefined;
                        readsCompleted?: number | undefined;
                        timeSpentReadMs?: number | undefined;
                        writesCompleted?: number | undefined;
                        timeSpentWriteMs?: number | undefined;
                    }[] & ({
                        name?: string | undefined;
                        type?: string | undefined;
                        mount?: string | undefined;
                        size?: number | undefined;
                        used?: number | undefined;
                        available?: number | undefined;
                        use?: number | undefined;
                        readsCompleted?: number | undefined;
                        timeSpentReadMs?: number | undefined;
                        writesCompleted?: number | undefined;
                        timeSpentWriteMs?: number | undefined;
                    } & {
                        name?: string | undefined;
                        type?: string | undefined;
                        mount?: string | undefined;
                        size?: number | undefined;
                        used?: number | undefined;
                        available?: number | undefined;
                        use?: number | undefined;
                        readsCompleted?: number | undefined;
                        timeSpentReadMs?: number | undefined;
                        writesCompleted?: number | undefined;
                        timeSpentWriteMs?: number | undefined;
                    } & { [K_16 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["fses"][number], keyof import("../../index").RuntimeInfoFs>]: never; })[] & { [K_17 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["fses"], keyof {
                        name?: string | undefined;
                        type?: string | undefined;
                        mount?: string | undefined;
                        size?: number | undefined;
                        used?: number | undefined;
                        available?: number | undefined;
                        use?: number | undefined;
                        readsCompleted?: number | undefined;
                        timeSpentReadMs?: number | undefined;
                        writesCompleted?: number | undefined;
                        timeSpentWriteMs?: number | undefined;
                    }[]>]: never; }) | undefined;
                    nets?: ({
                        name?: string | undefined;
                        mobileRxbytes?: number | undefined;
                        mobileTxbytes?: number | undefined;
                        wifiRxbytes?: number | undefined;
                        wifiTxbytes?: number | undefined;
                        totalRxbytes?: number | undefined;
                        totalTxbytes?: number | undefined;
                    }[] & ({
                        name?: string | undefined;
                        mobileRxbytes?: number | undefined;
                        mobileTxbytes?: number | undefined;
                        wifiRxbytes?: number | undefined;
                        wifiTxbytes?: number | undefined;
                        totalRxbytes?: number | undefined;
                        totalTxbytes?: number | undefined;
                    } & {
                        name?: string | undefined;
                        mobileRxbytes?: number | undefined;
                        mobileTxbytes?: number | undefined;
                        wifiRxbytes?: number | undefined;
                        wifiTxbytes?: number | undefined;
                        totalRxbytes?: number | undefined;
                        totalTxbytes?: number | undefined;
                    } & { [K_18 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["nets"][number], keyof import("../../index").RuntimeInfoNet>]: never; })[] & { [K_19 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["nets"], keyof {
                        name?: string | undefined;
                        mobileRxbytes?: number | undefined;
                        mobileTxbytes?: number | undefined;
                        wifiRxbytes?: number | undefined;
                        wifiTxbytes?: number | undefined;
                        totalRxbytes?: number | undefined;
                        totalTxbytes?: number | undefined;
                    }[]>]: never; }) | undefined;
                    displays?: ({
                        name?: string | undefined;
                        isScreenOn?: boolean | undefined;
                        error?: string | undefined;
                    }[] & ({
                        name?: string | undefined;
                        isScreenOn?: boolean | undefined;
                        error?: string | undefined;
                    } & {
                        name?: string | undefined;
                        isScreenOn?: boolean | undefined;
                        error?: string | undefined;
                    } & { [K_20 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["displays"][number], keyof import("../../index").RuntimeInfoDisplay>]: never; })[] & { [K_21 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["displays"], keyof {
                        name?: string | undefined;
                        isScreenOn?: boolean | undefined;
                        error?: string | undefined;
                    }[]>]: never; }) | undefined;
                    batteries?: ({
                        name?: string | undefined;
                        percent?: number | undefined;
                    }[] & ({
                        name?: string | undefined;
                        percent?: number | undefined;
                    } & {
                        name?: string | undefined;
                        percent?: number | undefined;
                    } & { [K_22 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["batteries"][number], keyof import("../../index").RuntimeInfoBattery>]: never; })[] & { [K_23 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["batteries"], keyof {
                        name?: string | undefined;
                        percent?: number | undefined;
                    }[]>]: never; }) | undefined;
                    processes?: ({
                        name?: string | undefined;
                        pid?: number | undefined;
                        isForeground?: boolean | undefined;
                        cpues?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            writeBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            sendBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                    }[] & ({
                        name?: string | undefined;
                        pid?: number | undefined;
                        isForeground?: boolean | undefined;
                        cpues?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            writeBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            sendBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                    } & {
                        name?: string | undefined;
                        pid?: number | undefined;
                        isForeground?: boolean | undefined;
                        cpues?: ({
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] & ({
                            name?: string | undefined;
                            percent?: number | undefined;
                        } & {
                            name?: string | undefined;
                            percent?: number | undefined;
                        } & { [K_24 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["cpues"][number], keyof import("../../index").RuntimeProcessInfoCpu>]: never; })[] & { [K_25 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["cpues"], keyof {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[]>]: never; }) | undefined;
                        mems?: ({
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] & ({
                            name?: string | undefined;
                            percent?: number | undefined;
                        } & {
                            name?: string | undefined;
                            percent?: number | undefined;
                        } & { [K_26 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["mems"][number], keyof import("../../index").RuntimeProcessInfoMem>]: never; })[] & { [K_27 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["mems"], keyof {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[]>]: never; }) | undefined;
                        fses?: ({
                            name?: string | undefined;
                            writeBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] & ({
                            name?: string | undefined;
                            writeBytes?: number | undefined;
                            readBytes?: number | undefined;
                        } & {
                            name?: string | undefined;
                            writeBytes?: number | undefined;
                            readBytes?: number | undefined;
                        } & { [K_28 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["fses"][number], keyof import("../../index").RuntimeProcessInfoFs>]: never; })[] & { [K_29 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["fses"], keyof {
                            name?: string | undefined;
                            writeBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[]>]: never; }) | undefined;
                        nets?: ({
                            name?: string | undefined;
                            sendBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] & ({
                            name?: string | undefined;
                            sendBytes?: number | undefined;
                            readBytes?: number | undefined;
                        } & {
                            name?: string | undefined;
                            sendBytes?: number | undefined;
                            readBytes?: number | undefined;
                        } & { [K_30 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["nets"][number], keyof import("../../index").RuntimeProcessInfoNet>]: never; })[] & { [K_31 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["nets"], keyof {
                            name?: string | undefined;
                            sendBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[]>]: never; }) | undefined;
                    } & { [K_32 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number], keyof import("../../index").RuntimeProcessInfo>]: never; })[] & { [K_33 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"]["processes"], keyof {
                        name?: string | undefined;
                        pid?: number | undefined;
                        isForeground?: boolean | undefined;
                        cpues?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            writeBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            sendBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[] | undefined;
                    }[]>]: never; }) | undefined;
                } & { [K_34 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"]["info"], keyof import("../../index").RuntimeInfo>]: never; }) | undefined;
            } & { [K_35 in Exclude<keyof I["value"]["dcIdaQueryProfileResult"], "info">]: never; }) | undefined;
            $case: "dcIdaQueryProfileResult";
        } & { [K_36 in Exclude<keyof I["value"], "$case" | "dcIdaQueryProfileResult">]: never; }) | ({
            dcGdcDaControlResult?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "dcGdcDaControlResult";
        } & {
            dcGdcDaControlResult?: ({
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
                    } & { [K_37 in Exclude<keyof I["value"]["dcGdcDaControlResult"]["error"]["details"], string | number>]: never; }) | undefined;
                } & { [K_38 in Exclude<keyof I["value"]["dcGdcDaControlResult"]["error"], keyof import("../../index").ErrorResult>]: never; }) | undefined;
            } & { [K_39 in Exclude<keyof I["value"]["dcGdcDaControlResult"], "error">]: never; }) | undefined;
            $case: "dcGdcDaControlResult";
        } & { [K_40 in Exclude<keyof I["value"], "$case" | "dcGdcDaControlResult">]: never; }) | undefined;
    } & { [K_41 in Exclude<keyof I, keyof DcIdaResult>]: never; }>(object: I): DcIdaResult;
};
export declare const DcIdaParamList: {
    encode(message: DcIdaParamList, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaParamList;
    fromJSON(object: any): DcIdaParamList;
    toJSON(message: DcIdaParamList): unknown;
    fromPartial<I extends {
        params?: {
            seq?: number | undefined;
            value?: ({
                dcIdaRunappParam?: {
                    appPath?: string | undefined;
                    installedAppNames?: string[] | undefined;
                    bundleId?: string | undefined;
                } | undefined;
            } & {
                $case: "dcIdaRunappParam";
            }) | ({
                dcIdaGetSystemInfoParam?: {} | undefined;
            } & {
                $case: "dcIdaGetSystemInfoParam";
            }) | ({
                dcIdaIsPortListeningParam?: {
                    port?: number | undefined;
                } | undefined;
            } & {
                $case: "dcIdaIsPortListeningParam";
            }) | ({
                dcIdaQueryProfileParam?: {
                    profileMethods?: {
                        kind?: import("../../index").ProfileMethodKind | undefined;
                        name?: string | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                $case: "dcIdaQueryProfileParam";
            }) | ({
                dcGdcDaControlParam?: {
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
                $case: "dcGdcDaControlParam";
            }) | undefined;
        }[] | undefined;
    } & {
        params?: ({
            seq?: number | undefined;
            value?: ({
                dcIdaRunappParam?: {
                    appPath?: string | undefined;
                    installedAppNames?: string[] | undefined;
                    bundleId?: string | undefined;
                } | undefined;
            } & {
                $case: "dcIdaRunappParam";
            }) | ({
                dcIdaGetSystemInfoParam?: {} | undefined;
            } & {
                $case: "dcIdaGetSystemInfoParam";
            }) | ({
                dcIdaIsPortListeningParam?: {
                    port?: number | undefined;
                } | undefined;
            } & {
                $case: "dcIdaIsPortListeningParam";
            }) | ({
                dcIdaQueryProfileParam?: {
                    profileMethods?: {
                        kind?: import("../../index").ProfileMethodKind | undefined;
                        name?: string | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                $case: "dcIdaQueryProfileParam";
            }) | ({
                dcGdcDaControlParam?: {
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
                $case: "dcGdcDaControlParam";
            }) | undefined;
        }[] & ({
            seq?: number | undefined;
            value?: ({
                dcIdaRunappParam?: {
                    appPath?: string | undefined;
                    installedAppNames?: string[] | undefined;
                    bundleId?: string | undefined;
                } | undefined;
            } & {
                $case: "dcIdaRunappParam";
            }) | ({
                dcIdaGetSystemInfoParam?: {} | undefined;
            } & {
                $case: "dcIdaGetSystemInfoParam";
            }) | ({
                dcIdaIsPortListeningParam?: {
                    port?: number | undefined;
                } | undefined;
            } & {
                $case: "dcIdaIsPortListeningParam";
            }) | ({
                dcIdaQueryProfileParam?: {
                    profileMethods?: {
                        kind?: import("../../index").ProfileMethodKind | undefined;
                        name?: string | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                $case: "dcIdaQueryProfileParam";
            }) | ({
                dcGdcDaControlParam?: {
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
                $case: "dcGdcDaControlParam";
            }) | undefined;
        } & {
            seq?: number | undefined;
            value?: ({
                dcIdaRunappParam?: {
                    appPath?: string | undefined;
                    installedAppNames?: string[] | undefined;
                    bundleId?: string | undefined;
                } | undefined;
            } & {
                $case: "dcIdaRunappParam";
            } & {
                dcIdaRunappParam?: ({
                    appPath?: string | undefined;
                    installedAppNames?: string[] | undefined;
                    bundleId?: string | undefined;
                } & {
                    appPath?: string | undefined;
                    installedAppNames?: (string[] & string[] & { [K in Exclude<keyof I["params"][number]["value"]["dcIdaRunappParam"]["installedAppNames"], keyof string[]>]: never; }) | undefined;
                    bundleId?: string | undefined;
                } & { [K_1 in Exclude<keyof I["params"][number]["value"]["dcIdaRunappParam"], keyof DcIdaRunAppParam>]: never; }) | undefined;
                $case: "dcIdaRunappParam";
            } & { [K_2 in Exclude<keyof I["params"][number]["value"], "$case" | "dcIdaRunappParam">]: never; }) | ({
                dcIdaGetSystemInfoParam?: {} | undefined;
            } & {
                $case: "dcIdaGetSystemInfoParam";
            } & {
                dcIdaGetSystemInfoParam?: ({} & {} & { [K_3 in Exclude<keyof I["params"][number]["value"]["dcIdaGetSystemInfoParam"], never>]: never; }) | undefined;
                $case: "dcIdaGetSystemInfoParam";
            } & { [K_4 in Exclude<keyof I["params"][number]["value"], "$case" | "dcIdaGetSystemInfoParam">]: never; }) | ({
                dcIdaIsPortListeningParam?: {
                    port?: number | undefined;
                } | undefined;
            } & {
                $case: "dcIdaIsPortListeningParam";
            } & {
                dcIdaIsPortListeningParam?: ({
                    port?: number | undefined;
                } & {
                    port?: number | undefined;
                } & { [K_5 in Exclude<keyof I["params"][number]["value"]["dcIdaIsPortListeningParam"], "port">]: never; }) | undefined;
                $case: "dcIdaIsPortListeningParam";
            } & { [K_6 in Exclude<keyof I["params"][number]["value"], "$case" | "dcIdaIsPortListeningParam">]: never; }) | ({
                dcIdaQueryProfileParam?: {
                    profileMethods?: {
                        kind?: import("../../index").ProfileMethodKind | undefined;
                        name?: string | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                $case: "dcIdaQueryProfileParam";
            } & {
                dcIdaQueryProfileParam?: ({
                    profileMethods?: {
                        kind?: import("../../index").ProfileMethodKind | undefined;
                        name?: string | undefined;
                    }[] | undefined;
                } & {
                    profileMethods?: ({
                        kind?: import("../../index").ProfileMethodKind | undefined;
                        name?: string | undefined;
                    }[] & ({
                        kind?: import("../../index").ProfileMethodKind | undefined;
                        name?: string | undefined;
                    } & {
                        kind?: import("../../index").ProfileMethodKind | undefined;
                        name?: string | undefined;
                    } & { [K_7 in Exclude<keyof I["params"][number]["value"]["dcIdaQueryProfileParam"]["profileMethods"][number], keyof import("../../index").ProfileMethod>]: never; })[] & { [K_8 in Exclude<keyof I["params"][number]["value"]["dcIdaQueryProfileParam"]["profileMethods"], keyof {
                        kind?: import("../../index").ProfileMethodKind | undefined;
                        name?: string | undefined;
                    }[]>]: never; }) | undefined;
                } & { [K_9 in Exclude<keyof I["params"][number]["value"]["dcIdaQueryProfileParam"], "profileMethods">]: never; }) | undefined;
                $case: "dcIdaQueryProfileParam";
            } & { [K_10 in Exclude<keyof I["params"][number]["value"], "$case" | "dcIdaQueryProfileParam">]: never; }) | ({
                dcGdcDaControlParam?: {
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
                $case: "dcGdcDaControlParam";
            } & {
                dcGdcDaControlParam?: ({
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
                        } & { [K_11 in Exclude<keyof I["params"][number]["value"]["dcGdcDaControlParam"]["control"]["position"], keyof import("../index").DevicePosition>]: never; }) | undefined;
                        hScroll?: number | undefined;
                        vScroll?: number | undefined;
                        copyKey?: import("../index").DeviceControlCopyKey | undefined;
                        paste?: boolean | undefined;
                        repeat?: number | undefined;
                        sequence?: number | undefined;
                        key?: string | undefined;
                        timeStamp?: number | undefined;
                    } & { [K_12 in Exclude<keyof I["params"][number]["value"]["dcGdcDaControlParam"]["control"], keyof import("../index").DeviceControl>]: never; }) | undefined;
                } & { [K_13 in Exclude<keyof I["params"][number]["value"]["dcGdcDaControlParam"], "control">]: never; }) | undefined;
                $case: "dcGdcDaControlParam";
            } & { [K_14 in Exclude<keyof I["params"][number]["value"], "$case" | "dcGdcDaControlParam">]: never; }) | undefined;
        } & { [K_15 in Exclude<keyof I["params"][number], keyof DcIdaParam>]: never; })[] & { [K_16 in Exclude<keyof I["params"], keyof {
            seq?: number | undefined;
            value?: ({
                dcIdaRunappParam?: {
                    appPath?: string | undefined;
                    installedAppNames?: string[] | undefined;
                    bundleId?: string | undefined;
                } | undefined;
            } & {
                $case: "dcIdaRunappParam";
            }) | ({
                dcIdaGetSystemInfoParam?: {} | undefined;
            } & {
                $case: "dcIdaGetSystemInfoParam";
            }) | ({
                dcIdaIsPortListeningParam?: {
                    port?: number | undefined;
                } | undefined;
            } & {
                $case: "dcIdaIsPortListeningParam";
            }) | ({
                dcIdaQueryProfileParam?: {
                    profileMethods?: {
                        kind?: import("../../index").ProfileMethodKind | undefined;
                        name?: string | undefined;
                    }[] | undefined;
                } | undefined;
            } & {
                $case: "dcIdaQueryProfileParam";
            }) | ({
                dcGdcDaControlParam?: {
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
                $case: "dcGdcDaControlParam";
            }) | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_17 in Exclude<keyof I, "params">]: never; }>(object: I): DcIdaParamList;
};
export declare const DcIdaResultList: {
    encode(message: DcIdaResultList, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaResultList;
    fromJSON(object: any): DcIdaResultList;
    toJSON(message: DcIdaResultList): unknown;
    fromPartial<I extends {
        results?: {
            seq?: number | undefined;
            value?: ({
                dcIdaRunappResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcIdaRunappResult";
            }) | ({
                dcIdaGetSystemInfoResult?: {
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                } | undefined;
            } & {
                $case: "dcIdaGetSystemInfoResult";
            }) | ({
                dcIdaIsPortListeningResult?: {
                    isListening?: boolean | undefined;
                } | undefined;
            } & {
                $case: "dcIdaIsPortListeningResult";
            }) | ({
                dcIdaQueryProfileResult?: {
                    info?: {
                        platform?: import("../../index").Platform | undefined;
                        localTimeStamp?: Date | undefined;
                        cpues?: {
                            name?: string | undefined;
                            currentLoad?: number | undefined;
                            currentLoadUser?: number | undefined;
                            currentLoadSystem?: number | undefined;
                            currentLoadNice?: number | undefined;
                            currentLoadIdle?: number | undefined;
                            currentLoadIrq?: number | undefined;
                            currentLoadCpu?: number | undefined;
                        }[] | undefined;
                        cpufreqs?: {
                            idx?: number | undefined;
                            min?: number | undefined;
                            cur?: number | undefined;
                            max?: number | undefined;
                        }[] | undefined;
                        gpues?: {
                            desc?: string | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            total?: number | undefined;
                            free?: number | undefined;
                            used?: number | undefined;
                            active?: number | undefined;
                            available?: number | undefined;
                            swaptotal?: number | undefined;
                            swapused?: number | undefined;
                            swapfree?: number | undefined;
                            isLow?: boolean | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            type?: string | undefined;
                            mount?: string | undefined;
                            size?: number | undefined;
                            used?: number | undefined;
                            available?: number | undefined;
                            use?: number | undefined;
                            readsCompleted?: number | undefined;
                            timeSpentReadMs?: number | undefined;
                            writesCompleted?: number | undefined;
                            timeSpentWriteMs?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            mobileRxbytes?: number | undefined;
                            mobileTxbytes?: number | undefined;
                            wifiRxbytes?: number | undefined;
                            wifiTxbytes?: number | undefined;
                            totalRxbytes?: number | undefined;
                            totalTxbytes?: number | undefined;
                        }[] | undefined;
                        displays?: {
                            name?: string | undefined;
                            isScreenOn?: boolean | undefined;
                            error?: string | undefined;
                        }[] | undefined;
                        batteries?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        processes?: {
                            name?: string | undefined;
                            pid?: number | undefined;
                            isForeground?: boolean | undefined;
                            cpues?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            mems?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            fses?: {
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                            nets?: {
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcIdaQueryProfileResult";
            }) | ({
                dcGdcDaControlResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcGdcDaControlResult";
            }) | undefined;
        }[] | undefined;
    } & {
        results?: ({
            seq?: number | undefined;
            value?: ({
                dcIdaRunappResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcIdaRunappResult";
            }) | ({
                dcIdaGetSystemInfoResult?: {
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                } | undefined;
            } & {
                $case: "dcIdaGetSystemInfoResult";
            }) | ({
                dcIdaIsPortListeningResult?: {
                    isListening?: boolean | undefined;
                } | undefined;
            } & {
                $case: "dcIdaIsPortListeningResult";
            }) | ({
                dcIdaQueryProfileResult?: {
                    info?: {
                        platform?: import("../../index").Platform | undefined;
                        localTimeStamp?: Date | undefined;
                        cpues?: {
                            name?: string | undefined;
                            currentLoad?: number | undefined;
                            currentLoadUser?: number | undefined;
                            currentLoadSystem?: number | undefined;
                            currentLoadNice?: number | undefined;
                            currentLoadIdle?: number | undefined;
                            currentLoadIrq?: number | undefined;
                            currentLoadCpu?: number | undefined;
                        }[] | undefined;
                        cpufreqs?: {
                            idx?: number | undefined;
                            min?: number | undefined;
                            cur?: number | undefined;
                            max?: number | undefined;
                        }[] | undefined;
                        gpues?: {
                            desc?: string | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            total?: number | undefined;
                            free?: number | undefined;
                            used?: number | undefined;
                            active?: number | undefined;
                            available?: number | undefined;
                            swaptotal?: number | undefined;
                            swapused?: number | undefined;
                            swapfree?: number | undefined;
                            isLow?: boolean | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            type?: string | undefined;
                            mount?: string | undefined;
                            size?: number | undefined;
                            used?: number | undefined;
                            available?: number | undefined;
                            use?: number | undefined;
                            readsCompleted?: number | undefined;
                            timeSpentReadMs?: number | undefined;
                            writesCompleted?: number | undefined;
                            timeSpentWriteMs?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            mobileRxbytes?: number | undefined;
                            mobileTxbytes?: number | undefined;
                            wifiRxbytes?: number | undefined;
                            wifiTxbytes?: number | undefined;
                            totalRxbytes?: number | undefined;
                            totalTxbytes?: number | undefined;
                        }[] | undefined;
                        displays?: {
                            name?: string | undefined;
                            isScreenOn?: boolean | undefined;
                            error?: string | undefined;
                        }[] | undefined;
                        batteries?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        processes?: {
                            name?: string | undefined;
                            pid?: number | undefined;
                            isForeground?: boolean | undefined;
                            cpues?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            mems?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            fses?: {
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                            nets?: {
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcIdaQueryProfileResult";
            }) | ({
                dcGdcDaControlResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcGdcDaControlResult";
            }) | undefined;
        }[] & ({
            seq?: number | undefined;
            value?: ({
                dcIdaRunappResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcIdaRunappResult";
            }) | ({
                dcIdaGetSystemInfoResult?: {
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                } | undefined;
            } & {
                $case: "dcIdaGetSystemInfoResult";
            }) | ({
                dcIdaIsPortListeningResult?: {
                    isListening?: boolean | undefined;
                } | undefined;
            } & {
                $case: "dcIdaIsPortListeningResult";
            }) | ({
                dcIdaQueryProfileResult?: {
                    info?: {
                        platform?: import("../../index").Platform | undefined;
                        localTimeStamp?: Date | undefined;
                        cpues?: {
                            name?: string | undefined;
                            currentLoad?: number | undefined;
                            currentLoadUser?: number | undefined;
                            currentLoadSystem?: number | undefined;
                            currentLoadNice?: number | undefined;
                            currentLoadIdle?: number | undefined;
                            currentLoadIrq?: number | undefined;
                            currentLoadCpu?: number | undefined;
                        }[] | undefined;
                        cpufreqs?: {
                            idx?: number | undefined;
                            min?: number | undefined;
                            cur?: number | undefined;
                            max?: number | undefined;
                        }[] | undefined;
                        gpues?: {
                            desc?: string | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            total?: number | undefined;
                            free?: number | undefined;
                            used?: number | undefined;
                            active?: number | undefined;
                            available?: number | undefined;
                            swaptotal?: number | undefined;
                            swapused?: number | undefined;
                            swapfree?: number | undefined;
                            isLow?: boolean | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            type?: string | undefined;
                            mount?: string | undefined;
                            size?: number | undefined;
                            used?: number | undefined;
                            available?: number | undefined;
                            use?: number | undefined;
                            readsCompleted?: number | undefined;
                            timeSpentReadMs?: number | undefined;
                            writesCompleted?: number | undefined;
                            timeSpentWriteMs?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            mobileRxbytes?: number | undefined;
                            mobileTxbytes?: number | undefined;
                            wifiRxbytes?: number | undefined;
                            wifiTxbytes?: number | undefined;
                            totalRxbytes?: number | undefined;
                            totalTxbytes?: number | undefined;
                        }[] | undefined;
                        displays?: {
                            name?: string | undefined;
                            isScreenOn?: boolean | undefined;
                            error?: string | undefined;
                        }[] | undefined;
                        batteries?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        processes?: {
                            name?: string | undefined;
                            pid?: number | undefined;
                            isForeground?: boolean | undefined;
                            cpues?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            mems?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            fses?: {
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                            nets?: {
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcIdaQueryProfileResult";
            }) | ({
                dcGdcDaControlResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcGdcDaControlResult";
            }) | undefined;
        } & {
            seq?: number | undefined;
            value?: ({
                dcIdaRunappResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcIdaRunappResult";
            } & {
                dcIdaRunappResult?: ({
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
                        } & { [K in Exclude<keyof I["results"][number]["value"]["dcIdaRunappResult"]["error"]["details"], string | number>]: never; }) | undefined;
                    } & { [K_1 in Exclude<keyof I["results"][number]["value"]["dcIdaRunappResult"]["error"], keyof import("../../index").ErrorResult>]: never; }) | undefined;
                } & { [K_2 in Exclude<keyof I["results"][number]["value"]["dcIdaRunappResult"], "error">]: never; }) | undefined;
                $case: "dcIdaRunappResult";
            } & { [K_3 in Exclude<keyof I["results"][number]["value"], "$case" | "dcIdaRunappResult">]: never; }) | ({
                dcIdaGetSystemInfoResult?: {
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                } | undefined;
            } & {
                $case: "dcIdaGetSystemInfoResult";
            } & {
                dcIdaGetSystemInfoResult?: ({
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                } & {
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                } & { [K_4 in Exclude<keyof I["results"][number]["value"]["dcIdaGetSystemInfoResult"], keyof DcIdaGetSystemInfoResult>]: never; }) | undefined;
                $case: "dcIdaGetSystemInfoResult";
            } & { [K_5 in Exclude<keyof I["results"][number]["value"], "$case" | "dcIdaGetSystemInfoResult">]: never; }) | ({
                dcIdaIsPortListeningResult?: {
                    isListening?: boolean | undefined;
                } | undefined;
            } & {
                $case: "dcIdaIsPortListeningResult";
            } & {
                dcIdaIsPortListeningResult?: ({
                    isListening?: boolean | undefined;
                } & {
                    isListening?: boolean | undefined;
                } & { [K_6 in Exclude<keyof I["results"][number]["value"]["dcIdaIsPortListeningResult"], "isListening">]: never; }) | undefined;
                $case: "dcIdaIsPortListeningResult";
            } & { [K_7 in Exclude<keyof I["results"][number]["value"], "$case" | "dcIdaIsPortListeningResult">]: never; }) | ({
                dcIdaQueryProfileResult?: {
                    info?: {
                        platform?: import("../../index").Platform | undefined;
                        localTimeStamp?: Date | undefined;
                        cpues?: {
                            name?: string | undefined;
                            currentLoad?: number | undefined;
                            currentLoadUser?: number | undefined;
                            currentLoadSystem?: number | undefined;
                            currentLoadNice?: number | undefined;
                            currentLoadIdle?: number | undefined;
                            currentLoadIrq?: number | undefined;
                            currentLoadCpu?: number | undefined;
                        }[] | undefined;
                        cpufreqs?: {
                            idx?: number | undefined;
                            min?: number | undefined;
                            cur?: number | undefined;
                            max?: number | undefined;
                        }[] | undefined;
                        gpues?: {
                            desc?: string | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            total?: number | undefined;
                            free?: number | undefined;
                            used?: number | undefined;
                            active?: number | undefined;
                            available?: number | undefined;
                            swaptotal?: number | undefined;
                            swapused?: number | undefined;
                            swapfree?: number | undefined;
                            isLow?: boolean | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            type?: string | undefined;
                            mount?: string | undefined;
                            size?: number | undefined;
                            used?: number | undefined;
                            available?: number | undefined;
                            use?: number | undefined;
                            readsCompleted?: number | undefined;
                            timeSpentReadMs?: number | undefined;
                            writesCompleted?: number | undefined;
                            timeSpentWriteMs?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            mobileRxbytes?: number | undefined;
                            mobileTxbytes?: number | undefined;
                            wifiRxbytes?: number | undefined;
                            wifiTxbytes?: number | undefined;
                            totalRxbytes?: number | undefined;
                            totalTxbytes?: number | undefined;
                        }[] | undefined;
                        displays?: {
                            name?: string | undefined;
                            isScreenOn?: boolean | undefined;
                            error?: string | undefined;
                        }[] | undefined;
                        batteries?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        processes?: {
                            name?: string | undefined;
                            pid?: number | undefined;
                            isForeground?: boolean | undefined;
                            cpues?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            mems?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            fses?: {
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                            nets?: {
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcIdaQueryProfileResult";
            } & {
                dcIdaQueryProfileResult?: ({
                    info?: {
                        platform?: import("../../index").Platform | undefined;
                        localTimeStamp?: Date | undefined;
                        cpues?: {
                            name?: string | undefined;
                            currentLoad?: number | undefined;
                            currentLoadUser?: number | undefined;
                            currentLoadSystem?: number | undefined;
                            currentLoadNice?: number | undefined;
                            currentLoadIdle?: number | undefined;
                            currentLoadIrq?: number | undefined;
                            currentLoadCpu?: number | undefined;
                        }[] | undefined;
                        cpufreqs?: {
                            idx?: number | undefined;
                            min?: number | undefined;
                            cur?: number | undefined;
                            max?: number | undefined;
                        }[] | undefined;
                        gpues?: {
                            desc?: string | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            total?: number | undefined;
                            free?: number | undefined;
                            used?: number | undefined;
                            active?: number | undefined;
                            available?: number | undefined;
                            swaptotal?: number | undefined;
                            swapused?: number | undefined;
                            swapfree?: number | undefined;
                            isLow?: boolean | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            type?: string | undefined;
                            mount?: string | undefined;
                            size?: number | undefined;
                            used?: number | undefined;
                            available?: number | undefined;
                            use?: number | undefined;
                            readsCompleted?: number | undefined;
                            timeSpentReadMs?: number | undefined;
                            writesCompleted?: number | undefined;
                            timeSpentWriteMs?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            mobileRxbytes?: number | undefined;
                            mobileTxbytes?: number | undefined;
                            wifiRxbytes?: number | undefined;
                            wifiTxbytes?: number | undefined;
                            totalRxbytes?: number | undefined;
                            totalTxbytes?: number | undefined;
                        }[] | undefined;
                        displays?: {
                            name?: string | undefined;
                            isScreenOn?: boolean | undefined;
                            error?: string | undefined;
                        }[] | undefined;
                        batteries?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        processes?: {
                            name?: string | undefined;
                            pid?: number | undefined;
                            isForeground?: boolean | undefined;
                            cpues?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            mems?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            fses?: {
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                            nets?: {
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } & {
                    info?: ({
                        platform?: import("../../index").Platform | undefined;
                        localTimeStamp?: Date | undefined;
                        cpues?: {
                            name?: string | undefined;
                            currentLoad?: number | undefined;
                            currentLoadUser?: number | undefined;
                            currentLoadSystem?: number | undefined;
                            currentLoadNice?: number | undefined;
                            currentLoadIdle?: number | undefined;
                            currentLoadIrq?: number | undefined;
                            currentLoadCpu?: number | undefined;
                        }[] | undefined;
                        cpufreqs?: {
                            idx?: number | undefined;
                            min?: number | undefined;
                            cur?: number | undefined;
                            max?: number | undefined;
                        }[] | undefined;
                        gpues?: {
                            desc?: string | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            total?: number | undefined;
                            free?: number | undefined;
                            used?: number | undefined;
                            active?: number | undefined;
                            available?: number | undefined;
                            swaptotal?: number | undefined;
                            swapused?: number | undefined;
                            swapfree?: number | undefined;
                            isLow?: boolean | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            type?: string | undefined;
                            mount?: string | undefined;
                            size?: number | undefined;
                            used?: number | undefined;
                            available?: number | undefined;
                            use?: number | undefined;
                            readsCompleted?: number | undefined;
                            timeSpentReadMs?: number | undefined;
                            writesCompleted?: number | undefined;
                            timeSpentWriteMs?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            mobileRxbytes?: number | undefined;
                            mobileTxbytes?: number | undefined;
                            wifiRxbytes?: number | undefined;
                            wifiTxbytes?: number | undefined;
                            totalRxbytes?: number | undefined;
                            totalTxbytes?: number | undefined;
                        }[] | undefined;
                        displays?: {
                            name?: string | undefined;
                            isScreenOn?: boolean | undefined;
                            error?: string | undefined;
                        }[] | undefined;
                        batteries?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        processes?: {
                            name?: string | undefined;
                            pid?: number | undefined;
                            isForeground?: boolean | undefined;
                            cpues?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            mems?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            fses?: {
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                            nets?: {
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                        }[] | undefined;
                    } & {
                        platform?: import("../../index").Platform | undefined;
                        localTimeStamp?: Date | undefined;
                        cpues?: ({
                            name?: string | undefined;
                            currentLoad?: number | undefined;
                            currentLoadUser?: number | undefined;
                            currentLoadSystem?: number | undefined;
                            currentLoadNice?: number | undefined;
                            currentLoadIdle?: number | undefined;
                            currentLoadIrq?: number | undefined;
                            currentLoadCpu?: number | undefined;
                        }[] & ({
                            name?: string | undefined;
                            currentLoad?: number | undefined;
                            currentLoadUser?: number | undefined;
                            currentLoadSystem?: number | undefined;
                            currentLoadNice?: number | undefined;
                            currentLoadIdle?: number | undefined;
                            currentLoadIrq?: number | undefined;
                            currentLoadCpu?: number | undefined;
                        } & {
                            name?: string | undefined;
                            currentLoad?: number | undefined;
                            currentLoadUser?: number | undefined;
                            currentLoadSystem?: number | undefined;
                            currentLoadNice?: number | undefined;
                            currentLoadIdle?: number | undefined;
                            currentLoadIrq?: number | undefined;
                            currentLoadCpu?: number | undefined;
                        } & { [K_8 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["cpues"][number], keyof import("../../index").RuntimeInfoCpu>]: never; })[] & { [K_9 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["cpues"], keyof {
                            name?: string | undefined;
                            currentLoad?: number | undefined;
                            currentLoadUser?: number | undefined;
                            currentLoadSystem?: number | undefined;
                            currentLoadNice?: number | undefined;
                            currentLoadIdle?: number | undefined;
                            currentLoadIrq?: number | undefined;
                            currentLoadCpu?: number | undefined;
                        }[]>]: never; }) | undefined;
                        cpufreqs?: ({
                            idx?: number | undefined;
                            min?: number | undefined;
                            cur?: number | undefined;
                            max?: number | undefined;
                        }[] & ({
                            idx?: number | undefined;
                            min?: number | undefined;
                            cur?: number | undefined;
                            max?: number | undefined;
                        } & {
                            idx?: number | undefined;
                            min?: number | undefined;
                            cur?: number | undefined;
                            max?: number | undefined;
                        } & { [K_10 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["cpufreqs"][number], keyof import("../../index").RuntimeInfoCpuFreq>]: never; })[] & { [K_11 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["cpufreqs"], keyof {
                            idx?: number | undefined;
                            min?: number | undefined;
                            cur?: number | undefined;
                            max?: number | undefined;
                        }[]>]: never; }) | undefined;
                        gpues?: ({
                            desc?: string | undefined;
                        }[] & ({
                            desc?: string | undefined;
                        } & {
                            desc?: string | undefined;
                        } & { [K_12 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["gpues"][number], "desc">]: never; })[] & { [K_13 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["gpues"], keyof {
                            desc?: string | undefined;
                        }[]>]: never; }) | undefined;
                        mems?: ({
                            name?: string | undefined;
                            total?: number | undefined;
                            free?: number | undefined;
                            used?: number | undefined;
                            active?: number | undefined;
                            available?: number | undefined;
                            swaptotal?: number | undefined;
                            swapused?: number | undefined;
                            swapfree?: number | undefined;
                            isLow?: boolean | undefined;
                        }[] & ({
                            name?: string | undefined;
                            total?: number | undefined;
                            free?: number | undefined;
                            used?: number | undefined;
                            active?: number | undefined;
                            available?: number | undefined;
                            swaptotal?: number | undefined;
                            swapused?: number | undefined;
                            swapfree?: number | undefined;
                            isLow?: boolean | undefined;
                        } & {
                            name?: string | undefined;
                            total?: number | undefined;
                            free?: number | undefined;
                            used?: number | undefined;
                            active?: number | undefined;
                            available?: number | undefined;
                            swaptotal?: number | undefined;
                            swapused?: number | undefined;
                            swapfree?: number | undefined;
                            isLow?: boolean | undefined;
                        } & { [K_14 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["mems"][number], keyof import("../../index").RuntimeInfoMem>]: never; })[] & { [K_15 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["mems"], keyof {
                            name?: string | undefined;
                            total?: number | undefined;
                            free?: number | undefined;
                            used?: number | undefined;
                            active?: number | undefined;
                            available?: number | undefined;
                            swaptotal?: number | undefined;
                            swapused?: number | undefined;
                            swapfree?: number | undefined;
                            isLow?: boolean | undefined;
                        }[]>]: never; }) | undefined;
                        fses?: ({
                            name?: string | undefined;
                            type?: string | undefined;
                            mount?: string | undefined;
                            size?: number | undefined;
                            used?: number | undefined;
                            available?: number | undefined;
                            use?: number | undefined;
                            readsCompleted?: number | undefined;
                            timeSpentReadMs?: number | undefined;
                            writesCompleted?: number | undefined;
                            timeSpentWriteMs?: number | undefined;
                        }[] & ({
                            name?: string | undefined;
                            type?: string | undefined;
                            mount?: string | undefined;
                            size?: number | undefined;
                            used?: number | undefined;
                            available?: number | undefined;
                            use?: number | undefined;
                            readsCompleted?: number | undefined;
                            timeSpentReadMs?: number | undefined;
                            writesCompleted?: number | undefined;
                            timeSpentWriteMs?: number | undefined;
                        } & {
                            name?: string | undefined;
                            type?: string | undefined;
                            mount?: string | undefined;
                            size?: number | undefined;
                            used?: number | undefined;
                            available?: number | undefined;
                            use?: number | undefined;
                            readsCompleted?: number | undefined;
                            timeSpentReadMs?: number | undefined;
                            writesCompleted?: number | undefined;
                            timeSpentWriteMs?: number | undefined;
                        } & { [K_16 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["fses"][number], keyof import("../../index").RuntimeInfoFs>]: never; })[] & { [K_17 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["fses"], keyof {
                            name?: string | undefined;
                            type?: string | undefined;
                            mount?: string | undefined;
                            size?: number | undefined;
                            used?: number | undefined;
                            available?: number | undefined;
                            use?: number | undefined;
                            readsCompleted?: number | undefined;
                            timeSpentReadMs?: number | undefined;
                            writesCompleted?: number | undefined;
                            timeSpentWriteMs?: number | undefined;
                        }[]>]: never; }) | undefined;
                        nets?: ({
                            name?: string | undefined;
                            mobileRxbytes?: number | undefined;
                            mobileTxbytes?: number | undefined;
                            wifiRxbytes?: number | undefined;
                            wifiTxbytes?: number | undefined;
                            totalRxbytes?: number | undefined;
                            totalTxbytes?: number | undefined;
                        }[] & ({
                            name?: string | undefined;
                            mobileRxbytes?: number | undefined;
                            mobileTxbytes?: number | undefined;
                            wifiRxbytes?: number | undefined;
                            wifiTxbytes?: number | undefined;
                            totalRxbytes?: number | undefined;
                            totalTxbytes?: number | undefined;
                        } & {
                            name?: string | undefined;
                            mobileRxbytes?: number | undefined;
                            mobileTxbytes?: number | undefined;
                            wifiRxbytes?: number | undefined;
                            wifiTxbytes?: number | undefined;
                            totalRxbytes?: number | undefined;
                            totalTxbytes?: number | undefined;
                        } & { [K_18 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["nets"][number], keyof import("../../index").RuntimeInfoNet>]: never; })[] & { [K_19 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["nets"], keyof {
                            name?: string | undefined;
                            mobileRxbytes?: number | undefined;
                            mobileTxbytes?: number | undefined;
                            wifiRxbytes?: number | undefined;
                            wifiTxbytes?: number | undefined;
                            totalRxbytes?: number | undefined;
                            totalTxbytes?: number | undefined;
                        }[]>]: never; }) | undefined;
                        displays?: ({
                            name?: string | undefined;
                            isScreenOn?: boolean | undefined;
                            error?: string | undefined;
                        }[] & ({
                            name?: string | undefined;
                            isScreenOn?: boolean | undefined;
                            error?: string | undefined;
                        } & {
                            name?: string | undefined;
                            isScreenOn?: boolean | undefined;
                            error?: string | undefined;
                        } & { [K_20 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["displays"][number], keyof import("../../index").RuntimeInfoDisplay>]: never; })[] & { [K_21 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["displays"], keyof {
                            name?: string | undefined;
                            isScreenOn?: boolean | undefined;
                            error?: string | undefined;
                        }[]>]: never; }) | undefined;
                        batteries?: ({
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] & ({
                            name?: string | undefined;
                            percent?: number | undefined;
                        } & {
                            name?: string | undefined;
                            percent?: number | undefined;
                        } & { [K_22 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["batteries"][number], keyof import("../../index").RuntimeInfoBattery>]: never; })[] & { [K_23 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["batteries"], keyof {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[]>]: never; }) | undefined;
                        processes?: ({
                            name?: string | undefined;
                            pid?: number | undefined;
                            isForeground?: boolean | undefined;
                            cpues?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            mems?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            fses?: {
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                            nets?: {
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                        }[] & ({
                            name?: string | undefined;
                            pid?: number | undefined;
                            isForeground?: boolean | undefined;
                            cpues?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            mems?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            fses?: {
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                            nets?: {
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                        } & {
                            name?: string | undefined;
                            pid?: number | undefined;
                            isForeground?: boolean | undefined;
                            cpues?: ({
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] & ({
                                name?: string | undefined;
                                percent?: number | undefined;
                            } & {
                                name?: string | undefined;
                                percent?: number | undefined;
                            } & { [K_24 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["cpues"][number], keyof import("../../index").RuntimeProcessInfoCpu>]: never; })[] & { [K_25 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["cpues"], keyof {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[]>]: never; }) | undefined;
                            mems?: ({
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] & ({
                                name?: string | undefined;
                                percent?: number | undefined;
                            } & {
                                name?: string | undefined;
                                percent?: number | undefined;
                            } & { [K_26 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["mems"][number], keyof import("../../index").RuntimeProcessInfoMem>]: never; })[] & { [K_27 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["mems"], keyof {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[]>]: never; }) | undefined;
                            fses?: ({
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] & ({
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            } & {
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            } & { [K_28 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["fses"][number], keyof import("../../index").RuntimeProcessInfoFs>]: never; })[] & { [K_29 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["fses"], keyof {
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[]>]: never; }) | undefined;
                            nets?: ({
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] & ({
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            } & {
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            } & { [K_30 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["nets"][number], keyof import("../../index").RuntimeProcessInfoNet>]: never; })[] & { [K_31 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number]["nets"], keyof {
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[]>]: never; }) | undefined;
                        } & { [K_32 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["processes"][number], keyof import("../../index").RuntimeProcessInfo>]: never; })[] & { [K_33 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"]["processes"], keyof {
                            name?: string | undefined;
                            pid?: number | undefined;
                            isForeground?: boolean | undefined;
                            cpues?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            mems?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            fses?: {
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                            nets?: {
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                        }[]>]: never; }) | undefined;
                    } & { [K_34 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"]["info"], keyof import("../../index").RuntimeInfo>]: never; }) | undefined;
                } & { [K_35 in Exclude<keyof I["results"][number]["value"]["dcIdaQueryProfileResult"], "info">]: never; }) | undefined;
                $case: "dcIdaQueryProfileResult";
            } & { [K_36 in Exclude<keyof I["results"][number]["value"], "$case" | "dcIdaQueryProfileResult">]: never; }) | ({
                dcGdcDaControlResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcGdcDaControlResult";
            } & {
                dcGdcDaControlResult?: ({
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
                        } & { [K_37 in Exclude<keyof I["results"][number]["value"]["dcGdcDaControlResult"]["error"]["details"], string | number>]: never; }) | undefined;
                    } & { [K_38 in Exclude<keyof I["results"][number]["value"]["dcGdcDaControlResult"]["error"], keyof import("../../index").ErrorResult>]: never; }) | undefined;
                } & { [K_39 in Exclude<keyof I["results"][number]["value"]["dcGdcDaControlResult"], "error">]: never; }) | undefined;
                $case: "dcGdcDaControlResult";
            } & { [K_40 in Exclude<keyof I["results"][number]["value"], "$case" | "dcGdcDaControlResult">]: never; }) | undefined;
        } & { [K_41 in Exclude<keyof I["results"][number], keyof DcIdaResult>]: never; })[] & { [K_42 in Exclude<keyof I["results"], keyof {
            seq?: number | undefined;
            value?: ({
                dcIdaRunappResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcIdaRunappResult";
            }) | ({
                dcIdaGetSystemInfoResult?: {
                    screenWidth?: number | undefined;
                    screenHeight?: number | undefined;
                } | undefined;
            } & {
                $case: "dcIdaGetSystemInfoResult";
            }) | ({
                dcIdaIsPortListeningResult?: {
                    isListening?: boolean | undefined;
                } | undefined;
            } & {
                $case: "dcIdaIsPortListeningResult";
            }) | ({
                dcIdaQueryProfileResult?: {
                    info?: {
                        platform?: import("../../index").Platform | undefined;
                        localTimeStamp?: Date | undefined;
                        cpues?: {
                            name?: string | undefined;
                            currentLoad?: number | undefined;
                            currentLoadUser?: number | undefined;
                            currentLoadSystem?: number | undefined;
                            currentLoadNice?: number | undefined;
                            currentLoadIdle?: number | undefined;
                            currentLoadIrq?: number | undefined;
                            currentLoadCpu?: number | undefined;
                        }[] | undefined;
                        cpufreqs?: {
                            idx?: number | undefined;
                            min?: number | undefined;
                            cur?: number | undefined;
                            max?: number | undefined;
                        }[] | undefined;
                        gpues?: {
                            desc?: string | undefined;
                        }[] | undefined;
                        mems?: {
                            name?: string | undefined;
                            total?: number | undefined;
                            free?: number | undefined;
                            used?: number | undefined;
                            active?: number | undefined;
                            available?: number | undefined;
                            swaptotal?: number | undefined;
                            swapused?: number | undefined;
                            swapfree?: number | undefined;
                            isLow?: boolean | undefined;
                        }[] | undefined;
                        fses?: {
                            name?: string | undefined;
                            type?: string | undefined;
                            mount?: string | undefined;
                            size?: number | undefined;
                            used?: number | undefined;
                            available?: number | undefined;
                            use?: number | undefined;
                            readsCompleted?: number | undefined;
                            timeSpentReadMs?: number | undefined;
                            writesCompleted?: number | undefined;
                            timeSpentWriteMs?: number | undefined;
                        }[] | undefined;
                        nets?: {
                            name?: string | undefined;
                            mobileRxbytes?: number | undefined;
                            mobileTxbytes?: number | undefined;
                            wifiRxbytes?: number | undefined;
                            wifiTxbytes?: number | undefined;
                            totalRxbytes?: number | undefined;
                            totalTxbytes?: number | undefined;
                        }[] | undefined;
                        displays?: {
                            name?: string | undefined;
                            isScreenOn?: boolean | undefined;
                            error?: string | undefined;
                        }[] | undefined;
                        batteries?: {
                            name?: string | undefined;
                            percent?: number | undefined;
                        }[] | undefined;
                        processes?: {
                            name?: string | undefined;
                            pid?: number | undefined;
                            isForeground?: boolean | undefined;
                            cpues?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            mems?: {
                                name?: string | undefined;
                                percent?: number | undefined;
                            }[] | undefined;
                            fses?: {
                                name?: string | undefined;
                                writeBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                            nets?: {
                                name?: string | undefined;
                                sendBytes?: number | undefined;
                                readBytes?: number | undefined;
                            }[] | undefined;
                        }[] | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcIdaQueryProfileResult";
            }) | ({
                dcGdcDaControlResult?: {
                    error?: {
                        code?: import("../../index").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } | undefined;
            } & {
                $case: "dcGdcDaControlResult";
            }) | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_43 in Exclude<keyof I, "results">]: never; }>(object: I): DcIdaResultList;
};
