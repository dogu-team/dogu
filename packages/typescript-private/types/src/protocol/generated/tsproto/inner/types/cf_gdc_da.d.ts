import _m0 from 'protobufjs/minimal';
import { ErrorResult } from '../../outer/errors';
import { WebSocketConnection } from '../../outer/http_ws';
import { DeviceControl } from './device_control';
export interface DataChannelProtocolDefault {
}
export interface DataChannelProtocolRelayTcp {
    port: number;
}
export interface DataChannelProtocolDeviceHttp {
}
export interface DataChannelProtocolDeviceWebSocket {
    connection: WebSocketConnection | undefined;
}
export interface DataChannelLabel {
    name: string;
    protocol?: {
        $case: 'default';
        default: DataChannelProtocolDefault;
    } | {
        $case: 'relayTcp';
        relayTcp: DataChannelProtocolRelayTcp;
    } | {
        $case: 'deviceHttp';
        deviceHttp: DataChannelProtocolDeviceHttp;
    } | {
        $case: 'deviceWebSocket';
        deviceWebSocket: DataChannelProtocolDeviceWebSocket;
    };
}
export interface CfGdcDaControlParam {
    control: DeviceControl | undefined;
}
export interface CfGdcDaControlResult {
    error: ErrorResult | undefined;
}
export declare const DataChannelProtocolDefault: {
    encode(_: DataChannelProtocolDefault, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DataChannelProtocolDefault;
    fromJSON(_: any): DataChannelProtocolDefault;
    toJSON(_: DataChannelProtocolDefault): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DataChannelProtocolDefault;
};
export declare const DataChannelProtocolRelayTcp: {
    encode(message: DataChannelProtocolRelayTcp, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DataChannelProtocolRelayTcp;
    fromJSON(object: any): DataChannelProtocolRelayTcp;
    toJSON(message: DataChannelProtocolRelayTcp): unknown;
    fromPartial<I extends {
        port?: number | undefined;
    } & {
        port?: number | undefined;
    } & { [K in Exclude<keyof I, "port">]: never; }>(object: I): DataChannelProtocolRelayTcp;
};
export declare const DataChannelProtocolDeviceHttp: {
    encode(_: DataChannelProtocolDeviceHttp, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DataChannelProtocolDeviceHttp;
    fromJSON(_: any): DataChannelProtocolDeviceHttp;
    toJSON(_: DataChannelProtocolDeviceHttp): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DataChannelProtocolDeviceHttp;
};
export declare const DataChannelProtocolDeviceWebSocket: {
    encode(message: DataChannelProtocolDeviceWebSocket, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DataChannelProtocolDeviceWebSocket;
    fromJSON(object: any): DataChannelProtocolDeviceWebSocket;
    toJSON(message: DataChannelProtocolDeviceWebSocket): unknown;
    fromPartial<I extends {
        connection?: {
            protocolDomain?: string | undefined;
            path?: string | undefined;
            query?: {
                [x: string]: any;
            } | undefined;
        } | undefined;
    } & {
        connection?: ({
            protocolDomain?: string | undefined;
            path?: string | undefined;
            query?: {
                [x: string]: any;
            } | undefined;
        } & {
            protocolDomain?: string | undefined;
            path?: string | undefined;
            query?: ({
                [x: string]: any;
            } & {
                [x: string]: any;
            } & { [K in Exclude<keyof I["connection"]["query"], string | number>]: never; }) | undefined;
        } & { [K_1 in Exclude<keyof I["connection"], keyof WebSocketConnection>]: never; }) | undefined;
    } & { [K_2 in Exclude<keyof I, "connection">]: never; }>(object: I): DataChannelProtocolDeviceWebSocket;
};
export declare const DataChannelLabel: {
    encode(message: DataChannelLabel, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DataChannelLabel;
    fromJSON(object: any): DataChannelLabel;
    toJSON(message: DataChannelLabel): unknown;
    fromPartial<I extends {
        name?: string | undefined;
        protocol?: ({
            default?: {} | undefined;
        } & {
            $case: "default";
        }) | ({
            relayTcp?: {
                port?: number | undefined;
            } | undefined;
        } & {
            $case: "relayTcp";
        }) | ({
            deviceHttp?: {} | undefined;
        } & {
            $case: "deviceHttp";
        }) | ({
            deviceWebSocket?: {
                connection?: {
                    protocolDomain?: string | undefined;
                    path?: string | undefined;
                    query?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "deviceWebSocket";
        }) | undefined;
    } & {
        name?: string | undefined;
        protocol?: ({
            default?: {} | undefined;
        } & {
            $case: "default";
        } & {
            default?: ({} & {} & { [K in Exclude<keyof I["protocol"]["default"], never>]: never; }) | undefined;
            $case: "default";
        } & { [K_1 in Exclude<keyof I["protocol"], "$case" | "default">]: never; }) | ({
            relayTcp?: {
                port?: number | undefined;
            } | undefined;
        } & {
            $case: "relayTcp";
        } & {
            relayTcp?: ({
                port?: number | undefined;
            } & {
                port?: number | undefined;
            } & { [K_2 in Exclude<keyof I["protocol"]["relayTcp"], "port">]: never; }) | undefined;
            $case: "relayTcp";
        } & { [K_3 in Exclude<keyof I["protocol"], "$case" | "relayTcp">]: never; }) | ({
            deviceHttp?: {} | undefined;
        } & {
            $case: "deviceHttp";
        } & {
            deviceHttp?: ({} & {} & { [K_4 in Exclude<keyof I["protocol"]["deviceHttp"], never>]: never; }) | undefined;
            $case: "deviceHttp";
        } & { [K_5 in Exclude<keyof I["protocol"], "$case" | "deviceHttp">]: never; }) | ({
            deviceWebSocket?: {
                connection?: {
                    protocolDomain?: string | undefined;
                    path?: string | undefined;
                    query?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "deviceWebSocket";
        } & {
            deviceWebSocket?: ({
                connection?: {
                    protocolDomain?: string | undefined;
                    path?: string | undefined;
                    query?: {
                        [x: string]: any;
                    } | undefined;
                } | undefined;
            } & {
                connection?: ({
                    protocolDomain?: string | undefined;
                    path?: string | undefined;
                    query?: {
                        [x: string]: any;
                    } | undefined;
                } & {
                    protocolDomain?: string | undefined;
                    path?: string | undefined;
                    query?: ({
                        [x: string]: any;
                    } & {
                        [x: string]: any;
                    } & { [K_6 in Exclude<keyof I["protocol"]["deviceWebSocket"]["connection"]["query"], string | number>]: never; }) | undefined;
                } & { [K_7 in Exclude<keyof I["protocol"]["deviceWebSocket"]["connection"], keyof WebSocketConnection>]: never; }) | undefined;
            } & { [K_8 in Exclude<keyof I["protocol"]["deviceWebSocket"], "connection">]: never; }) | undefined;
            $case: "deviceWebSocket";
        } & { [K_9 in Exclude<keyof I["protocol"], "$case" | "deviceWebSocket">]: never; }) | undefined;
    } & { [K_10 in Exclude<keyof I, keyof DataChannelLabel>]: never; }>(object: I): DataChannelLabel;
};
export declare const CfGdcDaControlParam: {
    encode(message: CfGdcDaControlParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CfGdcDaControlParam;
    fromJSON(object: any): CfGdcDaControlParam;
    toJSON(message: CfGdcDaControlParam): unknown;
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
    } & { [K_2 in Exclude<keyof I, "control">]: never; }>(object: I): CfGdcDaControlParam;
};
export declare const CfGdcDaControlResult: {
    encode(message: CfGdcDaControlResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CfGdcDaControlResult;
    fromJSON(object: any): CfGdcDaControlResult;
    toJSON(message: CfGdcDaControlResult): unknown;
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
    } & { [K_2 in Exclude<keyof I, "error">]: never; }>(object: I): CfGdcDaControlResult;
};
