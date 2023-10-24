import _m0 from 'protobufjs/minimal';
export interface RuntimeProcessInfoCpu {
    name: string;
    percent: number;
}
export interface RuntimeProcessInfoMem {
    name: string;
    percent: number;
}
export interface RuntimeProcessInfoFs {
    name: string;
    writeBytes: number;
    readBytes: number;
}
export interface RuntimeProcessInfoNet {
    name: string;
    sendBytes: number;
    readBytes: number;
}
export interface RuntimeProcessInfo {
    name: string;
    pid: number;
    isForeground: boolean;
    cpues: RuntimeProcessInfoCpu[];
    mems: RuntimeProcessInfoMem[];
    fses: RuntimeProcessInfoFs[];
    nets: RuntimeProcessInfoNet[];
}
export declare const RuntimeProcessInfoCpu: {
    encode(message: RuntimeProcessInfoCpu, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeProcessInfoCpu;
    fromJSON(object: any): RuntimeProcessInfoCpu;
    toJSON(message: RuntimeProcessInfoCpu): unknown;
    fromPartial<I extends {
        name?: string | undefined;
        percent?: number | undefined;
    } & {
        name?: string | undefined;
        percent?: number | undefined;
    } & { [K in Exclude<keyof I, keyof RuntimeProcessInfoCpu>]: never; }>(object: I): RuntimeProcessInfoCpu;
};
export declare const RuntimeProcessInfoMem: {
    encode(message: RuntimeProcessInfoMem, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeProcessInfoMem;
    fromJSON(object: any): RuntimeProcessInfoMem;
    toJSON(message: RuntimeProcessInfoMem): unknown;
    fromPartial<I extends {
        name?: string | undefined;
        percent?: number | undefined;
    } & {
        name?: string | undefined;
        percent?: number | undefined;
    } & { [K in Exclude<keyof I, keyof RuntimeProcessInfoMem>]: never; }>(object: I): RuntimeProcessInfoMem;
};
export declare const RuntimeProcessInfoFs: {
    encode(message: RuntimeProcessInfoFs, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeProcessInfoFs;
    fromJSON(object: any): RuntimeProcessInfoFs;
    toJSON(message: RuntimeProcessInfoFs): unknown;
    fromPartial<I extends {
        name?: string | undefined;
        writeBytes?: number | undefined;
        readBytes?: number | undefined;
    } & {
        name?: string | undefined;
        writeBytes?: number | undefined;
        readBytes?: number | undefined;
    } & { [K in Exclude<keyof I, keyof RuntimeProcessInfoFs>]: never; }>(object: I): RuntimeProcessInfoFs;
};
export declare const RuntimeProcessInfoNet: {
    encode(message: RuntimeProcessInfoNet, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeProcessInfoNet;
    fromJSON(object: any): RuntimeProcessInfoNet;
    toJSON(message: RuntimeProcessInfoNet): unknown;
    fromPartial<I extends {
        name?: string | undefined;
        sendBytes?: number | undefined;
        readBytes?: number | undefined;
    } & {
        name?: string | undefined;
        sendBytes?: number | undefined;
        readBytes?: number | undefined;
    } & { [K in Exclude<keyof I, keyof RuntimeProcessInfoNet>]: never; }>(object: I): RuntimeProcessInfoNet;
};
export declare const RuntimeProcessInfo: {
    encode(message: RuntimeProcessInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RuntimeProcessInfo;
    fromJSON(object: any): RuntimeProcessInfo;
    toJSON(message: RuntimeProcessInfo): unknown;
    fromPartial<I extends {
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
        } & { [K in Exclude<keyof I["cpues"][number], keyof RuntimeProcessInfoCpu>]: never; })[] & { [K_1 in Exclude<keyof I["cpues"], keyof {
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
        } & { [K_2 in Exclude<keyof I["mems"][number], keyof RuntimeProcessInfoMem>]: never; })[] & { [K_3 in Exclude<keyof I["mems"], keyof {
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
        } & { [K_4 in Exclude<keyof I["fses"][number], keyof RuntimeProcessInfoFs>]: never; })[] & { [K_5 in Exclude<keyof I["fses"], keyof {
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
        } & { [K_6 in Exclude<keyof I["nets"][number], keyof RuntimeProcessInfoNet>]: never; })[] & { [K_7 in Exclude<keyof I["nets"], keyof {
            name?: string | undefined;
            sendBytes?: number | undefined;
            readBytes?: number | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_8 in Exclude<keyof I, keyof RuntimeProcessInfo>]: never; }>(object: I): RuntimeProcessInfo;
};
