import _m0 from 'protobufjs/minimal';
import { Platform } from '../platform';
import { RuntimeProcessInfo } from './runtime_process_info';
export interface RuntimeInfoCpu {
    name: string;
    currentLoad: number;
    currentLoadUser: number;
    currentLoadSystem: number;
    currentLoadNice: number;
    currentLoadIdle: number;
    currentLoadIrq: number;
    currentLoadCpu: number;
}
export interface RuntimeInfoCpuFreq {
    idx: number;
    min: number;
    cur: number;
    max: number;
}
export interface RuntimeInfoGpu {
    desc: string;
}
export interface RuntimeInfoMem {
    name: string;
    total: number;
    free: number;
    used: number;
    active: number;
    available: number;
    swaptotal: number;
    swapused: number;
    swapfree: number;
    isLow: boolean;
}
export interface RuntimeInfoFs {
    name: string;
    type: string;
    mount: string;
    size: number;
    used: number;
    available: number;
    use: number;
    readsCompleted: number;
    timeSpentReadMs: number;
    writesCompleted: number;
    timeSpentWriteMs: number;
}
export interface RuntimeInfoNet {
    name: string;
    mobileRxbytes: number;
    mobileTxbytes: number;
    wifiRxbytes: number;
    wifiTxbytes: number;
    totalRxbytes: number;
    totalTxbytes: number;
}
export interface RuntimeInfoDisplay {
    name: string;
    isScreenOn: boolean;
    error?: string | undefined;
}
export interface RuntimeInfoBattery {
    name: string;
    percent: number;
}
export interface RuntimeInfo {
    platform?: Platform | undefined;
    localTimeStamp?: Date | undefined;
    cpues: RuntimeInfoCpu[];
    cpufreqs: RuntimeInfoCpuFreq[];
    gpues: RuntimeInfoGpu[];
    mems: RuntimeInfoMem[];
    fses: RuntimeInfoFs[];
    nets: RuntimeInfoNet[];
    displays: RuntimeInfoDisplay[];
    batteries: RuntimeInfoBattery[];
    processes: RuntimeProcessInfo[];
}
export declare const RuntimeInfoCpu: {
    encode(message: RuntimeInfoCpu, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoCpu;
    fromJSON(object: any): RuntimeInfoCpu;
    toJSON(message: RuntimeInfoCpu): unknown;
    fromPartial<I extends {
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
    } & { [K in Exclude<keyof I, keyof RuntimeInfoCpu>]: never; }>(object: I): RuntimeInfoCpu;
};
export declare const RuntimeInfoCpuFreq: {
    encode(message: RuntimeInfoCpuFreq, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoCpuFreq;
    fromJSON(object: any): RuntimeInfoCpuFreq;
    toJSON(message: RuntimeInfoCpuFreq): unknown;
    fromPartial<I extends {
        idx?: number | undefined;
        min?: number | undefined;
        cur?: number | undefined;
        max?: number | undefined;
    } & {
        idx?: number | undefined;
        min?: number | undefined;
        cur?: number | undefined;
        max?: number | undefined;
    } & { [K in Exclude<keyof I, keyof RuntimeInfoCpuFreq>]: never; }>(object: I): RuntimeInfoCpuFreq;
};
export declare const RuntimeInfoGpu: {
    encode(message: RuntimeInfoGpu, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoGpu;
    fromJSON(object: any): RuntimeInfoGpu;
    toJSON(message: RuntimeInfoGpu): unknown;
    fromPartial<I extends {
        desc?: string | undefined;
    } & {
        desc?: string | undefined;
    } & { [K in Exclude<keyof I, "desc">]: never; }>(object: I): RuntimeInfoGpu;
};
export declare const RuntimeInfoMem: {
    encode(message: RuntimeInfoMem, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoMem;
    fromJSON(object: any): RuntimeInfoMem;
    toJSON(message: RuntimeInfoMem): unknown;
    fromPartial<I extends {
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
    } & { [K in Exclude<keyof I, keyof RuntimeInfoMem>]: never; }>(object: I): RuntimeInfoMem;
};
export declare const RuntimeInfoFs: {
    encode(message: RuntimeInfoFs, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoFs;
    fromJSON(object: any): RuntimeInfoFs;
    toJSON(message: RuntimeInfoFs): unknown;
    fromPartial<I extends {
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
    } & { [K in Exclude<keyof I, keyof RuntimeInfoFs>]: never; }>(object: I): RuntimeInfoFs;
};
export declare const RuntimeInfoNet: {
    encode(message: RuntimeInfoNet, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoNet;
    fromJSON(object: any): RuntimeInfoNet;
    toJSON(message: RuntimeInfoNet): unknown;
    fromPartial<I extends {
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
    } & { [K in Exclude<keyof I, keyof RuntimeInfoNet>]: never; }>(object: I): RuntimeInfoNet;
};
export declare const RuntimeInfoDisplay: {
    encode(message: RuntimeInfoDisplay, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoDisplay;
    fromJSON(object: any): RuntimeInfoDisplay;
    toJSON(message: RuntimeInfoDisplay): unknown;
    fromPartial<I extends {
        name?: string | undefined;
        isScreenOn?: boolean | undefined;
        error?: string | undefined;
    } & {
        name?: string | undefined;
        isScreenOn?: boolean | undefined;
        error?: string | undefined;
    } & { [K in Exclude<keyof I, keyof RuntimeInfoDisplay>]: never; }>(object: I): RuntimeInfoDisplay;
};
export declare const RuntimeInfoBattery: {
    encode(message: RuntimeInfoBattery, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfoBattery;
    fromJSON(object: any): RuntimeInfoBattery;
    toJSON(message: RuntimeInfoBattery): unknown;
    fromPartial<I extends {
        name?: string | undefined;
        percent?: number | undefined;
    } & {
        name?: string | undefined;
        percent?: number | undefined;
    } & { [K in Exclude<keyof I, keyof RuntimeInfoBattery>]: never; }>(object: I): RuntimeInfoBattery;
};
export declare const RuntimeInfo: {
    encode(message: RuntimeInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeInfo;
    fromJSON(object: any): RuntimeInfo;
    toJSON(message: RuntimeInfo): unknown;
    fromPartial<I extends {
        platform?: Platform | undefined;
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
        platform?: Platform | undefined;
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
        } & { [K in Exclude<keyof I["cpues"][number], keyof RuntimeInfoCpu>]: never; })[] & { [K_1 in Exclude<keyof I["cpues"], keyof {
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
        } & { [K_2 in Exclude<keyof I["cpufreqs"][number], keyof RuntimeInfoCpuFreq>]: never; })[] & { [K_3 in Exclude<keyof I["cpufreqs"], keyof {
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
        } & { [K_4 in Exclude<keyof I["gpues"][number], "desc">]: never; })[] & { [K_5 in Exclude<keyof I["gpues"], keyof {
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
        } & { [K_6 in Exclude<keyof I["mems"][number], keyof RuntimeInfoMem>]: never; })[] & { [K_7 in Exclude<keyof I["mems"], keyof {
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
        } & { [K_8 in Exclude<keyof I["fses"][number], keyof RuntimeInfoFs>]: never; })[] & { [K_9 in Exclude<keyof I["fses"], keyof {
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
        } & { [K_10 in Exclude<keyof I["nets"][number], keyof RuntimeInfoNet>]: never; })[] & { [K_11 in Exclude<keyof I["nets"], keyof {
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
        } & { [K_12 in Exclude<keyof I["displays"][number], keyof RuntimeInfoDisplay>]: never; })[] & { [K_13 in Exclude<keyof I["displays"], keyof {
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
        } & { [K_14 in Exclude<keyof I["batteries"][number], keyof RuntimeInfoBattery>]: never; })[] & { [K_15 in Exclude<keyof I["batteries"], keyof {
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
            } & { [K_16 in Exclude<keyof I["processes"][number]["cpues"][number], keyof import("./runtime_process_info").RuntimeProcessInfoCpu>]: never; })[] & { [K_17 in Exclude<keyof I["processes"][number]["cpues"], keyof {
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
            } & { [K_18 in Exclude<keyof I["processes"][number]["mems"][number], keyof import("./runtime_process_info").RuntimeProcessInfoMem>]: never; })[] & { [K_19 in Exclude<keyof I["processes"][number]["mems"], keyof {
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
            } & { [K_20 in Exclude<keyof I["processes"][number]["fses"][number], keyof import("./runtime_process_info").RuntimeProcessInfoFs>]: never; })[] & { [K_21 in Exclude<keyof I["processes"][number]["fses"], keyof {
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
            } & { [K_22 in Exclude<keyof I["processes"][number]["nets"][number], keyof import("./runtime_process_info").RuntimeProcessInfoNet>]: never; })[] & { [K_23 in Exclude<keyof I["processes"][number]["nets"], keyof {
                name?: string | undefined;
                sendBytes?: number | undefined;
                readBytes?: number | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_24 in Exclude<keyof I["processes"][number], keyof RuntimeProcessInfo>]: never; })[] & { [K_25 in Exclude<keyof I["processes"], keyof {
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
    } & { [K_26 in Exclude<keyof I, keyof RuntimeInfo>]: never; }>(object: I): RuntimeInfo;
};
