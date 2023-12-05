import _m0 from 'protobufjs/minimal';
export interface DeviceServerToken {
    value: string;
}
export declare const DeviceServerToken: {
    encode(message: DeviceServerToken, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceServerToken;
    fromJSON(object: any): DeviceServerToken;
    toJSON(message: DeviceServerToken): unknown;
    fromPartial<I extends {
        value?: string | undefined;
    } & {
        value?: string | undefined;
    } & { [K in Exclude<keyof I, "value">]: never; }>(object: I): DeviceServerToken;
};
