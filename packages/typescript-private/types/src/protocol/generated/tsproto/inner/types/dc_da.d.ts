import _m0 from 'protobufjs/minimal';
import { ErrorResult } from '../../outer/errors';
import { ProfileMethod } from '../../outer/profile/profile_method';
import { RuntimeInfo } from '../../outer/profile/runtime_info';
import { StreamingOption } from '../../outer/streaming/streaming';
import { DeviceControl } from './device_control';
export interface DcDaConnectionParam {
    version: string;
    nickname: string;
}
export interface DcDaConnectionReturn {
}
export interface DcDaQueryProfileParam {
    profileMethods: ProfileMethod[];
}
export interface DcDaQueryProfileReturn {
    info: RuntimeInfo | undefined;
}
export interface DcDaApplyStreamingOptionParam {
    option: StreamingOption | undefined;
}
export interface DcDaApplyStreamingOptionReturn {
}
export interface DcDaControlParam {
    control: DeviceControl | undefined;
}
export interface DcDaControlReturn {
}
export interface DcDaGetFoldableStateParam {
}
export interface DcDaGetFoldableStateReturn {
    isFoldable: boolean;
    currentState: number;
    supportedStates: number[];
}
export interface DcDaSetFoldableStateParam {
    /** It's different by device. but normally smaller is closed */
    state: number;
}
export interface DcDaSetFoldableStateReturn {
    error: ErrorResult | undefined;
}
export declare const DcDaConnectionParam: {
    encode(message: DcDaConnectionParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaConnectionParam;
    fromJSON(object: any): DcDaConnectionParam;
    toJSON(message: DcDaConnectionParam): unknown;
    fromPartial<I extends {
        version?: string | undefined;
        nickname?: string | undefined;
    } & {
        version?: string | undefined;
        nickname?: string | undefined;
    } & { [K in Exclude<keyof I, keyof DcDaConnectionParam>]: never; }>(object: I): DcDaConnectionParam;
};
export declare const DcDaConnectionReturn: {
    encode(_: DcDaConnectionReturn, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaConnectionReturn;
    fromJSON(_: any): DcDaConnectionReturn;
    toJSON(_: DcDaConnectionReturn): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DcDaConnectionReturn;
};
export declare const DcDaQueryProfileParam: {
    encode(message: DcDaQueryProfileParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaQueryProfileParam;
    fromJSON(object: any): DcDaQueryProfileParam;
    toJSON(message: DcDaQueryProfileParam): unknown;
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
    } & { [K_2 in Exclude<keyof I, "profileMethods">]: never; }>(object: I): DcDaQueryProfileParam;
};
export declare const DcDaQueryProfileReturn: {
    encode(message: DcDaQueryProfileReturn, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaQueryProfileReturn;
    fromJSON(object: any): DcDaQueryProfileReturn;
    toJSON(message: DcDaQueryProfileReturn): unknown;
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
    } & { [K_27 in Exclude<keyof I, "info">]: never; }>(object: I): DcDaQueryProfileReturn;
};
export declare const DcDaApplyStreamingOptionParam: {
    encode(message: DcDaApplyStreamingOptionParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaApplyStreamingOptionParam;
    fromJSON(object: any): DcDaApplyStreamingOptionParam;
    toJSON(message: DcDaApplyStreamingOptionParam): unknown;
    fromPartial<I extends {
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
            } & { [K in Exclude<keyof I["option"]["screen"], keyof import("../../index").ScreenCaptureOption>]: never; }) | undefined;
        } & { [K_1 in Exclude<keyof I["option"], "screen">]: never; }) | undefined;
    } & { [K_2 in Exclude<keyof I, "option">]: never; }>(object: I): DcDaApplyStreamingOptionParam;
};
export declare const DcDaApplyStreamingOptionReturn: {
    encode(_: DcDaApplyStreamingOptionReturn, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaApplyStreamingOptionReturn;
    fromJSON(_: any): DcDaApplyStreamingOptionReturn;
    toJSON(_: DcDaApplyStreamingOptionReturn): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DcDaApplyStreamingOptionReturn;
};
export declare const DcDaControlParam: {
    encode(message: DcDaControlParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaControlParam;
    fromJSON(object: any): DcDaControlParam;
    toJSON(message: DcDaControlParam): unknown;
    fromPartial<I extends {
        control?: {
            type?: import("./device_control").DeviceControlType | undefined;
            text?: string | undefined;
            metaState?: import("./device_control").DeviceControlMetaState | undefined;
            action?: import("./device_control").DeviceControlAction | undefined;
            keycode?: import("./device_control").DeviceControlKeycode | undefined;
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
            copyKey?: import("./device_control").DeviceControlCopyKey | undefined;
            paste?: boolean | undefined;
            repeat?: number | undefined;
            sequence?: number | undefined;
            key?: string | undefined;
            timeStamp?: number | undefined;
        } | undefined;
    } & {
        control?: ({
            type?: import("./device_control").DeviceControlType | undefined;
            text?: string | undefined;
            metaState?: import("./device_control").DeviceControlMetaState | undefined;
            action?: import("./device_control").DeviceControlAction | undefined;
            keycode?: import("./device_control").DeviceControlKeycode | undefined;
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
            copyKey?: import("./device_control").DeviceControlCopyKey | undefined;
            paste?: boolean | undefined;
            repeat?: number | undefined;
            sequence?: number | undefined;
            key?: string | undefined;
            timeStamp?: number | undefined;
        } & {
            type?: import("./device_control").DeviceControlType | undefined;
            text?: string | undefined;
            metaState?: import("./device_control").DeviceControlMetaState | undefined;
            action?: import("./device_control").DeviceControlAction | undefined;
            keycode?: import("./device_control").DeviceControlKeycode | undefined;
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
            } & { [K in Exclude<keyof I["control"]["position"], keyof import("./device_control").DevicePosition>]: never; }) | undefined;
            hScroll?: number | undefined;
            vScroll?: number | undefined;
            copyKey?: import("./device_control").DeviceControlCopyKey | undefined;
            paste?: boolean | undefined;
            repeat?: number | undefined;
            sequence?: number | undefined;
            key?: string | undefined;
            timeStamp?: number | undefined;
        } & { [K_1 in Exclude<keyof I["control"], keyof DeviceControl>]: never; }) | undefined;
    } & { [K_2 in Exclude<keyof I, "control">]: never; }>(object: I): DcDaControlParam;
};
export declare const DcDaControlReturn: {
    encode(_: DcDaControlReturn, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaControlReturn;
    fromJSON(_: any): DcDaControlReturn;
    toJSON(_: DcDaControlReturn): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DcDaControlReturn;
};
export declare const DcDaGetFoldableStateParam: {
    encode(_: DcDaGetFoldableStateParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaGetFoldableStateParam;
    fromJSON(_: any): DcDaGetFoldableStateParam;
    toJSON(_: DcDaGetFoldableStateParam): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DcDaGetFoldableStateParam;
};
export declare const DcDaGetFoldableStateReturn: {
    encode(message: DcDaGetFoldableStateReturn, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaGetFoldableStateReturn;
    fromJSON(object: any): DcDaGetFoldableStateReturn;
    toJSON(message: DcDaGetFoldableStateReturn): unknown;
    fromPartial<I extends {
        isFoldable?: boolean | undefined;
        currentState?: number | undefined;
        supportedStates?: number[] | undefined;
    } & {
        isFoldable?: boolean | undefined;
        currentState?: number | undefined;
        supportedStates?: (number[] & number[] & { [K in Exclude<keyof I["supportedStates"], keyof number[]>]: never; }) | undefined;
    } & { [K_1 in Exclude<keyof I, keyof DcDaGetFoldableStateReturn>]: never; }>(object: I): DcDaGetFoldableStateReturn;
};
export declare const DcDaSetFoldableStateParam: {
    encode(message: DcDaSetFoldableStateParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaSetFoldableStateParam;
    fromJSON(object: any): DcDaSetFoldableStateParam;
    toJSON(message: DcDaSetFoldableStateParam): unknown;
    fromPartial<I extends {
        state?: number | undefined;
    } & {
        state?: number | undefined;
    } & { [K in Exclude<keyof I, "state">]: never; }>(object: I): DcDaSetFoldableStateParam;
};
export declare const DcDaSetFoldableStateReturn: {
    encode(message: DcDaSetFoldableStateReturn, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DcDaSetFoldableStateReturn;
    fromJSON(object: any): DcDaSetFoldableStateReturn;
    toJSON(message: DcDaSetFoldableStateReturn): unknown;
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
    } & { [K_2 in Exclude<keyof I, "error">]: never; }>(object: I): DcDaSetFoldableStateReturn;
};
