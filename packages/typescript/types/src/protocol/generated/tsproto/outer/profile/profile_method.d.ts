import _m0 from 'protobufjs/minimal';
export declare enum ProfileMethodKind {
    PROFILE_METHOD_KIND_UNSPECIFIED = 0,
    PROFILE_METHOD_KIND_DESKTOP_CPU = 1,
    PROFILE_METHOD_KIND_DESKTOP_CPUFREQ = 10,
    PROFILE_METHOD_KIND_DESKTOP_GPU = 20,
    PROFILE_METHOD_KIND_DESKTOP_MEM = 30,
    PROFILE_METHOD_KIND_DESKTOP_FS = 40,
    PROFILE_METHOD_KIND_DESKTOP_NET = 50,
    PROFILE_METHOD_KIND_DESKTOP_DISPLAY = 60,
    PROFILE_METHOD_KIND_ANDROID_CPU_SHELLTOP = 1001,
    PROFILE_METHOD_KIND_ANDROID_CPUFREQ_CAT = 1010,
    PROFILE_METHOD_KIND_ANDROID_GPU_NOTYET = 1020,
    PROFILE_METHOD_KIND_ANDROID_MEM_ACTIVITYMANAGER = 1030,
    PROFILE_METHOD_KIND_ANDROID_MEM_PROCMEMINFO = 1031,
    PROFILE_METHOD_KIND_ANDROID_FS_PROCDISKSTATS = 1040,
    PROFILE_METHOD_KIND_ANDROID_NET_TRAFFICSTATS = 1050,
    PROFILE_METHOD_KIND_ANDROID_DISPLAY = 1060,
    PROFILE_METHOD_KIND_ANDROID_PROCESS_SHELLTOP = 1070,
    PROFILE_METHOD_KIND_ANDROID_BLOCK_DEVELOPER_OPTIONS = 1080,
    PROFILE_METHOD_KIND_IOS_CPU_LOAD_INFO = 2001,
    PROFILE_METHOD_KIND_IOS_MEM_VM_STATISTICS = 2030,
    PROFILE_METHOD_KIND_IOS_DISPLAY = 2060,
    UNRECOGNIZED = -1
}
export declare function profileMethodKindFromJSON(object: any): ProfileMethodKind;
export declare function profileMethodKindToJSON(object: ProfileMethodKind): string;
export interface ProfileMethod {
    kind: ProfileMethodKind;
    name: string;
}
export interface ProfileMethodWithConfig {
    profileMethod: ProfileMethod | undefined;
    periodSec: number;
}
export interface DeviceConfig {
    profileMethods: ProfileMethodWithConfig[];
}
export declare const ProfileMethod: {
    encode(message: ProfileMethod, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ProfileMethod;
    fromJSON(object: any): ProfileMethod;
    toJSON(message: ProfileMethod): unknown;
    fromPartial<I extends {
        kind?: ProfileMethodKind | undefined;
        name?: string | undefined;
    } & {
        kind?: ProfileMethodKind | undefined;
        name?: string | undefined;
    } & { [K in Exclude<keyof I, keyof ProfileMethod>]: never; }>(object: I): ProfileMethod;
};
export declare const ProfileMethodWithConfig: {
    encode(message: ProfileMethodWithConfig, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ProfileMethodWithConfig;
    fromJSON(object: any): ProfileMethodWithConfig;
    toJSON(message: ProfileMethodWithConfig): unknown;
    fromPartial<I extends {
        profileMethod?: {
            kind?: ProfileMethodKind | undefined;
            name?: string | undefined;
        } | undefined;
        periodSec?: number | undefined;
    } & {
        profileMethod?: ({
            kind?: ProfileMethodKind | undefined;
            name?: string | undefined;
        } & {
            kind?: ProfileMethodKind | undefined;
            name?: string | undefined;
        } & { [K in Exclude<keyof I["profileMethod"], keyof ProfileMethod>]: never; }) | undefined;
        periodSec?: number | undefined;
    } & { [K_1 in Exclude<keyof I, keyof ProfileMethodWithConfig>]: never; }>(object: I): ProfileMethodWithConfig;
};
export declare const DeviceConfig: {
    encode(message: DeviceConfig, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceConfig;
    fromJSON(object: any): DeviceConfig;
    toJSON(message: DeviceConfig): unknown;
    fromPartial<I extends {
        profileMethods?: {
            profileMethod?: {
                kind?: ProfileMethodKind | undefined;
                name?: string | undefined;
            } | undefined;
            periodSec?: number | undefined;
        }[] | undefined;
    } & {
        profileMethods?: ({
            profileMethod?: {
                kind?: ProfileMethodKind | undefined;
                name?: string | undefined;
            } | undefined;
            periodSec?: number | undefined;
        }[] & ({
            profileMethod?: {
                kind?: ProfileMethodKind | undefined;
                name?: string | undefined;
            } | undefined;
            periodSec?: number | undefined;
        } & {
            profileMethod?: ({
                kind?: ProfileMethodKind | undefined;
                name?: string | undefined;
            } & {
                kind?: ProfileMethodKind | undefined;
                name?: string | undefined;
            } & { [K in Exclude<keyof I["profileMethods"][number]["profileMethod"], keyof ProfileMethod>]: never; }) | undefined;
            periodSec?: number | undefined;
        } & { [K_1 in Exclude<keyof I["profileMethods"][number], keyof ProfileMethodWithConfig>]: never; })[] & { [K_2 in Exclude<keyof I["profileMethods"], keyof {
            profileMethod?: {
                kind?: ProfileMethodKind | undefined;
                name?: string | undefined;
            } | undefined;
            periodSec?: number | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_3 in Exclude<keyof I, "profileMethods">]: never; }>(object: I): DeviceConfig;
};
