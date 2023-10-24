import _m0 from 'protobufjs/minimal';
import { ErrorResult } from '../../outer/errors';
import { ProfileMethod } from '../../outer/profile/profile_method';
import { RuntimeInfo } from '../../outer/profile/runtime_info';
export interface DcIdaRunAppParam {
    appPath: string;
    installedAppNames: string[];
    bundleId: string;
}
export interface DcIdaRunAppResult {
    error: ErrorResult | undefined;
}
export interface DcIdaGetSystemInfoParam {
}
export interface DcIdaGetSystemInfoResult {
    screenWidth: number;
    screenHeight: number;
}
export interface DcIdaIsPortListeningParam {
    port: number;
}
export interface DcIdaIsPortListeningResult {
    isListening: boolean;
}
export interface DcIdaQueryProfileParam {
    profileMethods: ProfileMethod[];
}
export interface DcIdaQueryProfileResult {
    info: RuntimeInfo | undefined;
}
export declare const DcIdaRunAppParam: {
    encode(message: DcIdaRunAppParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaRunAppParam;
    fromJSON(object: any): DcIdaRunAppParam;
    toJSON(message: DcIdaRunAppParam): unknown;
    fromPartial<I extends {
        appPath?: string | undefined;
        installedAppNames?: string[] | undefined;
        bundleId?: string | undefined;
    } & {
        appPath?: string | undefined;
        installedAppNames?: (string[] & string[] & { [K in Exclude<keyof I["installedAppNames"], keyof string[]>]: never; }) | undefined;
        bundleId?: string | undefined;
    } & { [K_1 in Exclude<keyof I, keyof DcIdaRunAppParam>]: never; }>(object: I): DcIdaRunAppParam;
};
export declare const DcIdaRunAppResult: {
    encode(message: DcIdaRunAppResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaRunAppResult;
    fromJSON(object: any): DcIdaRunAppResult;
    toJSON(message: DcIdaRunAppResult): unknown;
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
    } & { [K_2 in Exclude<keyof I, "error">]: never; }>(object: I): DcIdaRunAppResult;
};
export declare const DcIdaGetSystemInfoParam: {
    encode(_: DcIdaGetSystemInfoParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaGetSystemInfoParam;
    fromJSON(_: any): DcIdaGetSystemInfoParam;
    toJSON(_: DcIdaGetSystemInfoParam): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DcIdaGetSystemInfoParam;
};
export declare const DcIdaGetSystemInfoResult: {
    encode(message: DcIdaGetSystemInfoResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaGetSystemInfoResult;
    fromJSON(object: any): DcIdaGetSystemInfoResult;
    toJSON(message: DcIdaGetSystemInfoResult): unknown;
    fromPartial<I extends {
        screenWidth?: number | undefined;
        screenHeight?: number | undefined;
    } & {
        screenWidth?: number | undefined;
        screenHeight?: number | undefined;
    } & { [K in Exclude<keyof I, keyof DcIdaGetSystemInfoResult>]: never; }>(object: I): DcIdaGetSystemInfoResult;
};
export declare const DcIdaIsPortListeningParam: {
    encode(message: DcIdaIsPortListeningParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaIsPortListeningParam;
    fromJSON(object: any): DcIdaIsPortListeningParam;
    toJSON(message: DcIdaIsPortListeningParam): unknown;
    fromPartial<I extends {
        port?: number | undefined;
    } & {
        port?: number | undefined;
    } & { [K in Exclude<keyof I, "port">]: never; }>(object: I): DcIdaIsPortListeningParam;
};
export declare const DcIdaIsPortListeningResult: {
    encode(message: DcIdaIsPortListeningResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaIsPortListeningResult;
    fromJSON(object: any): DcIdaIsPortListeningResult;
    toJSON(message: DcIdaIsPortListeningResult): unknown;
    fromPartial<I extends {
        isListening?: boolean | undefined;
    } & {
        isListening?: boolean | undefined;
    } & { [K in Exclude<keyof I, "isListening">]: never; }>(object: I): DcIdaIsPortListeningResult;
};
export declare const DcIdaQueryProfileParam: {
    encode(message: DcIdaQueryProfileParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaQueryProfileParam;
    fromJSON(object: any): DcIdaQueryProfileParam;
    toJSON(message: DcIdaQueryProfileParam): unknown;
    fromPartial<I extends {
        profileMethods?: {
            kind?: import("../../outer/profile/profile_method").ProfileMethodKind | undefined;
            name?: string | undefined;
        }[] | undefined;
    } & {
        profileMethods?: ({
            kind?: import("../../outer/profile/profile_method").ProfileMethodKind | undefined;
            name?: string | undefined;
        }[] & ({
            kind?: import("../../outer/profile/profile_method").ProfileMethodKind | undefined;
            name?: string | undefined;
        } & {
            kind?: import("../../outer/profile/profile_method").ProfileMethodKind | undefined;
            name?: string | undefined;
        } & { [K in Exclude<keyof I["profileMethods"][number], keyof ProfileMethod>]: never; })[] & { [K_1 in Exclude<keyof I["profileMethods"], keyof {
            kind?: import("../../outer/profile/profile_method").ProfileMethodKind | undefined;
            name?: string | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_2 in Exclude<keyof I, "profileMethods">]: never; }>(object: I): DcIdaQueryProfileParam;
};
export declare const DcIdaQueryProfileResult: {
    encode(message: DcIdaQueryProfileResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcIdaQueryProfileResult;
    fromJSON(object: any): DcIdaQueryProfileResult;
    toJSON(message: DcIdaQueryProfileResult): unknown;
    fromPartial<I extends {
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
            } & { [K in Exclude<keyof I["info"]["cpues"][number], keyof import("../../outer/profile/runtime_info").RuntimeInfoCpu>]: never; })[] & { [K_1 in Exclude<keyof I["info"]["cpues"], keyof {
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
            } & { [K_2 in Exclude<keyof I["info"]["cpufreqs"][number], keyof import("../../outer/profile/runtime_info").RuntimeInfoCpuFreq>]: never; })[] & { [K_3 in Exclude<keyof I["info"]["cpufreqs"], keyof {
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
            } & { [K_4 in Exclude<keyof I["info"]["gpues"][number], "desc">]: never; })[] & { [K_5 in Exclude<keyof I["info"]["gpues"], keyof {
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
            } & { [K_6 in Exclude<keyof I["info"]["mems"][number], keyof import("../../outer/profile/runtime_info").RuntimeInfoMem>]: never; })[] & { [K_7 in Exclude<keyof I["info"]["mems"], keyof {
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
            } & { [K_8 in Exclude<keyof I["info"]["fses"][number], keyof import("../../outer/profile/runtime_info").RuntimeInfoFs>]: never; })[] & { [K_9 in Exclude<keyof I["info"]["fses"], keyof {
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
            } & { [K_10 in Exclude<keyof I["info"]["nets"][number], keyof import("../../outer/profile/runtime_info").RuntimeInfoNet>]: never; })[] & { [K_11 in Exclude<keyof I["info"]["nets"], keyof {
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
            } & { [K_12 in Exclude<keyof I["info"]["displays"][number], keyof import("../../outer/profile/runtime_info").RuntimeInfoDisplay>]: never; })[] & { [K_13 in Exclude<keyof I["info"]["displays"], keyof {
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
            } & { [K_14 in Exclude<keyof I["info"]["batteries"][number], keyof import("../../outer/profile/runtime_info").RuntimeInfoBattery>]: never; })[] & { [K_15 in Exclude<keyof I["info"]["batteries"], keyof {
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
                } & { [K_16 in Exclude<keyof I["info"]["processes"][number]["cpues"][number], keyof import("../../index").RuntimeProcessInfoCpu>]: never; })[] & { [K_17 in Exclude<keyof I["info"]["processes"][number]["cpues"], keyof {
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
                } & { [K_18 in Exclude<keyof I["info"]["processes"][number]["mems"][number], keyof import("../../index").RuntimeProcessInfoMem>]: never; })[] & { [K_19 in Exclude<keyof I["info"]["processes"][number]["mems"], keyof {
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
                } & { [K_20 in Exclude<keyof I["info"]["processes"][number]["fses"][number], keyof import("../../index").RuntimeProcessInfoFs>]: never; })[] & { [K_21 in Exclude<keyof I["info"]["processes"][number]["fses"], keyof {
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
                } & { [K_22 in Exclude<keyof I["info"]["processes"][number]["nets"][number], keyof import("../../index").RuntimeProcessInfoNet>]: never; })[] & { [K_23 in Exclude<keyof I["info"]["processes"][number]["nets"], keyof {
                    name?: string | undefined;
                    sendBytes?: number | undefined;
                    readBytes?: number | undefined;
                }[]>]: never; }) | undefined;
            } & { [K_24 in Exclude<keyof I["info"]["processes"][number], keyof import("../../index").RuntimeProcessInfo>]: never; })[] & { [K_25 in Exclude<keyof I["info"]["processes"], keyof {
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
        } & { [K_26 in Exclude<keyof I["info"], keyof RuntimeInfo>]: never; }) | undefined;
    } & { [K_27 in Exclude<keyof I, "info">]: never; }>(object: I): DcIdaQueryProfileResult;
};
