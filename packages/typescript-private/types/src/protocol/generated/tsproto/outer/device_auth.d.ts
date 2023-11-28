import _m0 from 'protobufjs/minimal';
export interface DeviceTemporaryToken {
    value: string;
}
export declare const DeviceTemporaryToken: {
    encode(message: DeviceTemporaryToken, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceTemporaryToken;
    fromJSON(object: any): DeviceTemporaryToken;
    toJSON(message: DeviceTemporaryToken): unknown;
    fromPartial<I extends {
        value?: string | undefined;
    } & {
        value?: string | undefined;
    } & { [K in Exclude<keyof I, "value">]: never; }>(object: I): DeviceTemporaryToken;
};
