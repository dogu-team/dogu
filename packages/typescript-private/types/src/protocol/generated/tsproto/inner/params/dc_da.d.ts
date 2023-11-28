import _m0 from 'protobufjs/minimal';
import { DcDaApplyStreamingOptionParam, DcDaApplyStreamingOptionReturn, DcDaConnectionParam, DcDaConnectionReturn, DcDaControlParam, DcDaControlReturn, DcDaGetFoldableStateParam, DcDaGetFoldableStateReturn, DcDaQueryProfileParam, DcDaQueryProfileReturn, DcDaSetFoldableStateParam, DcDaSetFoldableStateReturn } from '../types/dc_da';
export interface DcDaParam {
    seq: number;
    value?: {
        $case: 'dcDaConnectionParam';
        dcDaConnectionParam: DcDaConnectionParam;
    } | {
        $case: 'dcDaQueryProfileParam';
        dcDaQueryProfileParam: DcDaQueryProfileParam;
    } | {
        $case: 'dcDaApplyStreamingOptionParam';
        dcDaApplyStreamingOptionParam: DcDaApplyStreamingOptionParam;
    } | {
        $case: 'dcDaControlParam';
        dcDaControlParam: DcDaControlParam;
    } | {
        $case: 'dcDaGetFoldableStateParam';
        dcDaGetFoldableStateParam: DcDaGetFoldableStateParam;
    } | {
        $case: 'dcDaSetFoldableStateParam';
        dcDaSetFoldableStateParam: DcDaSetFoldableStateParam;
    };
}
export interface DcDaReturn {
    seq: number;
    value?: {
        $case: 'dcDaConnectionReturn';
        dcDaConnectionReturn: DcDaConnectionReturn;
    } | {
        $case: 'dcDaQueryProfileReturn';
        dcDaQueryProfileReturn: DcDaQueryProfileReturn;
    } | {
        $case: 'dcDaApplyStreamingOptionReturn';
        dcDaApplyStreamingOptionReturn: DcDaApplyStreamingOptionReturn;
    } | {
        $case: 'dcDaControlReturn';
        dcDaControlReturn: DcDaControlReturn;
    } | {
        $case: 'dcDaGetFoldableStateReturn';
        dcDaGetFoldableStateReturn: DcDaGetFoldableStateReturn;
    } | {
        $case: 'dcDaSetFoldableStateReturn';
        dcDaSetFoldableStateReturn: DcDaSetFoldableStateReturn;
    };
}
export declare const DcDaParam: {
    encode(message: DcDaParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaParam;
    fromJSON(object: any): DcDaParam;
    toJSON(message: DcDaParam): unknown;
    fromPartial<I extends {
        seq?: number | undefined;
        value?: ({
            dcDaConnectionParam?: {
                version?: string | undefined;
                nickname?: string | undefined;
            } | undefined;
        } & {
            $case: "dcDaConnectionParam";
        }) | ({
            dcDaQueryProfileParam?: {
                profileMethods?: {
                    kind?: import("../../index").ProfileMethodKind | undefined;
                    name?: string | undefined;
                }[] | undefined;
            } | undefined;
        } & {
            $case: "dcDaQueryProfileParam";
        }) | ({
            dcDaApplyStreamingOptionParam?: {
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
            } | undefined;
        } & {
            $case: "dcDaApplyStreamingOptionParam";
        }) | ({
            dcDaControlParam?: {
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
            $case: "dcDaControlParam";
        }) | ({
            dcDaGetFoldableStateParam?: {} | undefined;
        } & {
            $case: "dcDaGetFoldableStateParam";
        }) | ({
            dcDaSetFoldableStateParam?: {
                state?: number | undefined;
            } | undefined;
        } & {
            $case: "dcDaSetFoldableStateParam";
        }) | undefined;
    } & {
        seq?: number | undefined;
        value?: ({
            dcDaConnectionParam?: {
                version?: string | undefined;
                nickname?: string | undefined;
            } | undefined;
        } & {
            $case: "dcDaConnectionParam";
        } & {
            dcDaConnectionParam?: ({
                version?: string | undefined;
                nickname?: string | undefined;
            } & {
                version?: string | undefined;
                nickname?: string | undefined;
            } & { [K in Exclude<keyof I["value"]["dcDaConnectionParam"], keyof DcDaConnectionParam>]: never; }) | undefined;
            $case: "dcDaConnectionParam";
        } & { [K_1 in Exclude<keyof I["value"], "$case" | "dcDaConnectionParam">]: never; }) | ({
            dcDaQueryProfileParam?: {
                profileMethods?: {
                    kind?: import("../../index").ProfileMethodKind | undefined;
                    name?: string | undefined;
                }[] | undefined;
            } | undefined;
        } & {
            $case: "dcDaQueryProfileParam";
        } & {
            dcDaQueryProfileParam?: ({
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
                } & { [K_2 in Exclude<keyof I["value"]["dcDaQueryProfileParam"]["profileMethods"][number], keyof import("../../index").ProfileMethod>]: never; })[] & { [K_3 in Exclude<keyof I["value"]["dcDaQueryProfileParam"]["profileMethods"], keyof {
                    kind?: import("../../index").ProfileMethodKind | undefined;
                    name?: string | undefined;
                }[]>]: never; }) | undefined;
            } & { [K_4 in Exclude<keyof I["value"]["dcDaQueryProfileParam"], "profileMethods">]: never; }) | undefined;
            $case: "dcDaQueryProfileParam";
        } & { [K_5 in Exclude<keyof I["value"], "$case" | "dcDaQueryProfileParam">]: never; }) | ({
            dcDaApplyStreamingOptionParam?: {
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
            } | undefined;
        } & {
            $case: "dcDaApplyStreamingOptionParam";
        } & {
            dcDaApplyStreamingOptionParam?: ({
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
            } & {
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
                    } & { [K_6 in Exclude<keyof I["value"]["dcDaApplyStreamingOptionParam"]["option"]["screen"], keyof import("../../index").ScreenCaptureOption>]: never; }) | undefined;
                } & { [K_7 in Exclude<keyof I["value"]["dcDaApplyStreamingOptionParam"]["option"], "screen">]: never; }) | undefined;
            } & { [K_8 in Exclude<keyof I["value"]["dcDaApplyStreamingOptionParam"], "option">]: never; }) | undefined;
            $case: "dcDaApplyStreamingOptionParam";
        } & { [K_9 in Exclude<keyof I["value"], "$case" | "dcDaApplyStreamingOptionParam">]: never; }) | ({
            dcDaControlParam?: {
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
            $case: "dcDaControlParam";
        } & {
            dcDaControlParam?: ({
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
                    } & { [K_10 in Exclude<keyof I["value"]["dcDaControlParam"]["control"]["position"], keyof import("../index").DevicePosition>]: never; }) | undefined;
                    hScroll?: number | undefined;
                    vScroll?: number | undefined;
                    copyKey?: import("../index").DeviceControlCopyKey | undefined;
                    paste?: boolean | undefined;
                    repeat?: number | undefined;
                    sequence?: number | undefined;
                    key?: string | undefined;
                    timeStamp?: number | undefined;
                } & { [K_11 in Exclude<keyof I["value"]["dcDaControlParam"]["control"], keyof import("../index").DeviceControl>]: never; }) | undefined;
            } & { [K_12 in Exclude<keyof I["value"]["dcDaControlParam"], "control">]: never; }) | undefined;
            $case: "dcDaControlParam";
        } & { [K_13 in Exclude<keyof I["value"], "$case" | "dcDaControlParam">]: never; }) | ({
            dcDaGetFoldableStateParam?: {} | undefined;
        } & {
            $case: "dcDaGetFoldableStateParam";
        } & {
            dcDaGetFoldableStateParam?: ({} & {} & { [K_14 in Exclude<keyof I["value"]["dcDaGetFoldableStateParam"], never>]: never; }) | undefined;
            $case: "dcDaGetFoldableStateParam";
        } & { [K_15 in Exclude<keyof I["value"], "$case" | "dcDaGetFoldableStateParam">]: never; }) | ({
            dcDaSetFoldableStateParam?: {
                state?: number | undefined;
            } | undefined;
        } & {
            $case: "dcDaSetFoldableStateParam";
        } & {
            dcDaSetFoldableStateParam?: ({
                state?: number | undefined;
            } & {
                state?: number | undefined;
            } & { [K_16 in Exclude<keyof I["value"]["dcDaSetFoldableStateParam"], "state">]: never; }) | undefined;
            $case: "dcDaSetFoldableStateParam";
        } & { [K_17 in Exclude<keyof I["value"], "$case" | "dcDaSetFoldableStateParam">]: never; }) | undefined;
    } & { [K_18 in Exclude<keyof I, keyof DcDaParam>]: never; }>(object: I): DcDaParam;
};
export declare const DcDaReturn: {
    encode(message: DcDaReturn, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaReturn;
    fromJSON(object: any): DcDaReturn;
    toJSON(message: DcDaReturn): unknown;
    fromPartial<I extends {
        seq?: number | undefined;
        value?: ({
            dcDaConnectionReturn?: {} | undefined;
        } & {
            $case: "dcDaConnectionReturn";
        }) | ({
            dcDaQueryProfileReturn?: {
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
            $case: "dcDaQueryProfileReturn";
        }) | ({
            dcDaApplyStreamingOptionReturn?: {} | undefined;
        } & {
            $case: "dcDaApplyStreamingOptionReturn";
        }) | ({
            dcDaControlReturn?: {} | undefined;
        } & {
            $case: "dcDaControlReturn";
        }) | ({
            dcDaGetFoldableStateReturn?: {
                isFoldable?: boolean | undefined;
                currentState?: number | undefined;
                supportedStates?: number[] | undefined;
            } | undefined;
        } & {
            $case: "dcDaGetFoldableStateReturn";
        }) | ({
            dcDaSetFoldableStateReturn?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "dcDaSetFoldableStateReturn";
        }) | undefined;
    } & {
        seq?: number | undefined;
        value?: ({
            dcDaConnectionReturn?: {} | undefined;
        } & {
            $case: "dcDaConnectionReturn";
        } & {
            dcDaConnectionReturn?: ({} & {} & { [K in Exclude<keyof I["value"]["dcDaConnectionReturn"], never>]: never; }) | undefined;
            $case: "dcDaConnectionReturn";
        } & { [K_1 in Exclude<keyof I["value"], "$case" | "dcDaConnectionReturn">]: never; }) | ({
            dcDaQueryProfileReturn?: {
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
            $case: "dcDaQueryProfileReturn";
        } & {
            dcDaQueryProfileReturn?: ({
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
                    } & { [K_2 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["cpues"][number], keyof import("../../index").RuntimeInfoCpu>]: never; })[] & { [K_3 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["cpues"], keyof {
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
                    } & { [K_4 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["cpufreqs"][number], keyof import("../../index").RuntimeInfoCpuFreq>]: never; })[] & { [K_5 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["cpufreqs"], keyof {
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
                    } & { [K_6 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["gpues"][number], "desc">]: never; })[] & { [K_7 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["gpues"], keyof {
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
                    } & { [K_8 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["mems"][number], keyof import("../../index").RuntimeInfoMem>]: never; })[] & { [K_9 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["mems"], keyof {
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
                    } & { [K_10 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["fses"][number], keyof import("../../index").RuntimeInfoFs>]: never; })[] & { [K_11 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["fses"], keyof {
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
                    } & { [K_12 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["nets"][number], keyof import("../../index").RuntimeInfoNet>]: never; })[] & { [K_13 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["nets"], keyof {
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
                    } & { [K_14 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["displays"][number], keyof import("../../index").RuntimeInfoDisplay>]: never; })[] & { [K_15 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["displays"], keyof {
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
                    } & { [K_16 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["batteries"][number], keyof import("../../index").RuntimeInfoBattery>]: never; })[] & { [K_17 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["batteries"], keyof {
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
                        } & { [K_18 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["processes"][number]["cpues"][number], keyof import("../../index").RuntimeProcessInfoCpu>]: never; })[] & { [K_19 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["processes"][number]["cpues"], keyof {
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
                        } & { [K_20 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["processes"][number]["mems"][number], keyof import("../../index").RuntimeProcessInfoMem>]: never; })[] & { [K_21 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["processes"][number]["mems"], keyof {
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
                        } & { [K_22 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["processes"][number]["fses"][number], keyof import("../../index").RuntimeProcessInfoFs>]: never; })[] & { [K_23 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["processes"][number]["fses"], keyof {
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
                        } & { [K_24 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["processes"][number]["nets"][number], keyof import("../../index").RuntimeProcessInfoNet>]: never; })[] & { [K_25 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["processes"][number]["nets"], keyof {
                            name?: string | undefined;
                            sendBytes?: number | undefined;
                            readBytes?: number | undefined;
                        }[]>]: never; }) | undefined;
                    } & { [K_26 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["processes"][number], keyof import("../../index").RuntimeProcessInfo>]: never; })[] & { [K_27 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"]["processes"], keyof {
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
                } & { [K_28 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"]["info"], keyof import("../../index").RuntimeInfo>]: never; }) | undefined;
            } & { [K_29 in Exclude<keyof I["value"]["dcDaQueryProfileReturn"], "info">]: never; }) | undefined;
            $case: "dcDaQueryProfileReturn";
        } & { [K_30 in Exclude<keyof I["value"], "$case" | "dcDaQueryProfileReturn">]: never; }) | ({
            dcDaApplyStreamingOptionReturn?: {} | undefined;
        } & {
            $case: "dcDaApplyStreamingOptionReturn";
        } & {
            dcDaApplyStreamingOptionReturn?: ({} & {} & { [K_31 in Exclude<keyof I["value"]["dcDaApplyStreamingOptionReturn"], never>]: never; }) | undefined;
            $case: "dcDaApplyStreamingOptionReturn";
        } & { [K_32 in Exclude<keyof I["value"], "$case" | "dcDaApplyStreamingOptionReturn">]: never; }) | ({
            dcDaControlReturn?: {} | undefined;
        } & {
            $case: "dcDaControlReturn";
        } & {
            dcDaControlReturn?: ({} & {} & { [K_33 in Exclude<keyof I["value"]["dcDaControlReturn"], never>]: never; }) | undefined;
            $case: "dcDaControlReturn";
        } & { [K_34 in Exclude<keyof I["value"], "$case" | "dcDaControlReturn">]: never; }) | ({
            dcDaGetFoldableStateReturn?: {
                isFoldable?: boolean | undefined;
                currentState?: number | undefined;
                supportedStates?: number[] | undefined;
            } | undefined;
        } & {
            $case: "dcDaGetFoldableStateReturn";
        } & {
            dcDaGetFoldableStateReturn?: ({
                isFoldable?: boolean | undefined;
                currentState?: number | undefined;
                supportedStates?: number[] | undefined;
            } & {
                isFoldable?: boolean | undefined;
                currentState?: number | undefined;
                supportedStates?: (number[] & number[] & { [K_35 in Exclude<keyof I["value"]["dcDaGetFoldableStateReturn"]["supportedStates"], keyof number[]>]: never; }) | undefined;
            } & { [K_36 in Exclude<keyof I["value"]["dcDaGetFoldableStateReturn"], keyof DcDaGetFoldableStateReturn>]: never; }) | undefined;
            $case: "dcDaGetFoldableStateReturn";
        } & { [K_37 in Exclude<keyof I["value"], "$case" | "dcDaGetFoldableStateReturn">]: never; }) | ({
            dcDaSetFoldableStateReturn?: {
                error?: {
                    code?: import("../../index").Code | undefined;
                    message?: string | undefined;
                    details?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "dcDaSetFoldableStateReturn";
        } & {
            dcDaSetFoldableStateReturn?: ({
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
                    } & { [K_38 in Exclude<keyof I["value"]["dcDaSetFoldableStateReturn"]["error"]["details"], string | number>]: never; }) | undefined;
                } & { [K_39 in Exclude<keyof I["value"]["dcDaSetFoldableStateReturn"]["error"], keyof import("../../index").ErrorResult>]: never; }) | undefined;
            } & { [K_40 in Exclude<keyof I["value"]["dcDaSetFoldableStateReturn"], "error">]: never; }) | undefined;
            $case: "dcDaSetFoldableStateReturn";
        } & { [K_41 in Exclude<keyof I["value"], "$case" | "dcDaSetFoldableStateReturn">]: never; }) | undefined;
    } & { [K_42 in Exclude<keyof I, keyof DcDaReturn>]: never; }>(object: I): DcDaReturn;
};
