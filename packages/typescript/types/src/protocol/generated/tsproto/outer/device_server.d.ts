import _m0 from 'protobufjs/minimal';
import { ErrorResult } from './errors';
export interface DeviceHostUploadFileStartSendValue {
    fileName: string;
    fileSize: number;
}
export interface DeviceHostUploadFileInProgressSendValue {
    chunk: Uint8Array;
}
export interface DeviceHostUploadFileCompleteSendValue {
}
export interface DeviceHostUploadFileSendMessage {
    value?: {
        $case: 'start';
        start: DeviceHostUploadFileStartSendValue;
    } | {
        $case: 'inProgress';
        inProgress: DeviceHostUploadFileInProgressSendValue;
    } | {
        $case: 'complete';
        complete: DeviceHostUploadFileCompleteSendValue;
    };
}
export interface DeviceHostUploadFileInProgressReceiveValue {
    offset: number;
}
export interface DeviceHostUploadFileCompleteReceiveValue {
    filePath: string;
}
export interface DeviceHostUploadFileReceiveMessage {
    value?: {
        $case: 'inProgress';
        inProgress: DeviceHostUploadFileInProgressReceiveValue;
    } | {
        $case: 'complete';
        complete: DeviceHostUploadFileCompleteReceiveValue;
    };
}
export interface DeviceServerResponse {
    value?: {
        $case: 'error';
        error: ErrorResult;
    } | {
        $case: 'data';
        data: {
            [key: string]: any;
        } | undefined;
    };
}
export declare const DeviceHostUploadFileStartSendValue: {
    encode(message: DeviceHostUploadFileStartSendValue, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileStartSendValue;
    fromJSON(object: any): DeviceHostUploadFileStartSendValue;
    toJSON(message: DeviceHostUploadFileStartSendValue): unknown;
    fromPartial<I extends {
        fileName?: string | undefined;
        fileSize?: number | undefined;
    } & {
        fileName?: string | undefined;
        fileSize?: number | undefined;
    } & { [K in Exclude<keyof I, keyof DeviceHostUploadFileStartSendValue>]: never; }>(object: I): DeviceHostUploadFileStartSendValue;
};
export declare const DeviceHostUploadFileInProgressSendValue: {
    encode(message: DeviceHostUploadFileInProgressSendValue, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileInProgressSendValue;
    fromJSON(object: any): DeviceHostUploadFileInProgressSendValue;
    toJSON(message: DeviceHostUploadFileInProgressSendValue): unknown;
    fromPartial<I extends {
        chunk?: Uint8Array | undefined;
    } & {
        chunk?: Uint8Array | undefined;
    } & { [K in Exclude<keyof I, "chunk">]: never; }>(object: I): DeviceHostUploadFileInProgressSendValue;
};
export declare const DeviceHostUploadFileCompleteSendValue: {
    encode(_: DeviceHostUploadFileCompleteSendValue, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileCompleteSendValue;
    fromJSON(_: any): DeviceHostUploadFileCompleteSendValue;
    toJSON(_: DeviceHostUploadFileCompleteSendValue): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): DeviceHostUploadFileCompleteSendValue;
};
export declare const DeviceHostUploadFileSendMessage: {
    encode(message: DeviceHostUploadFileSendMessage, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileSendMessage;
    fromJSON(object: any): DeviceHostUploadFileSendMessage;
    toJSON(message: DeviceHostUploadFileSendMessage): unknown;
    fromPartial<I extends {
        value?: ({
            start?: {
                fileName?: string | undefined;
                fileSize?: number | undefined;
            } | undefined;
        } & {
            $case: "start";
        }) | ({
            inProgress?: {
                chunk?: Uint8Array | undefined;
            } | undefined;
        } & {
            $case: "inProgress";
        }) | ({
            complete?: {} | undefined;
        } & {
            $case: "complete";
        }) | undefined;
    } & {
        value?: ({
            start?: {
                fileName?: string | undefined;
                fileSize?: number | undefined;
            } | undefined;
        } & {
            $case: "start";
        } & {
            start?: ({
                fileName?: string | undefined;
                fileSize?: number | undefined;
            } & {
                fileName?: string | undefined;
                fileSize?: number | undefined;
            } & { [K in Exclude<keyof I["value"]["start"], keyof DeviceHostUploadFileStartSendValue>]: never; }) | undefined;
            $case: "start";
        } & { [K_1 in Exclude<keyof I["value"], "$case" | "start">]: never; }) | ({
            inProgress?: {
                chunk?: Uint8Array | undefined;
            } | undefined;
        } & {
            $case: "inProgress";
        } & {
            inProgress?: ({
                chunk?: Uint8Array | undefined;
            } & {
                chunk?: Uint8Array | undefined;
            } & { [K_2 in Exclude<keyof I["value"]["inProgress"], "chunk">]: never; }) | undefined;
            $case: "inProgress";
        } & { [K_3 in Exclude<keyof I["value"], "$case" | "inProgress">]: never; }) | ({
            complete?: {} | undefined;
        } & {
            $case: "complete";
        } & {
            complete?: ({} & {} & { [K_4 in Exclude<keyof I["value"]["complete"], never>]: never; }) | undefined;
            $case: "complete";
        } & { [K_5 in Exclude<keyof I["value"], "$case" | "complete">]: never; }) | undefined;
    } & { [K_6 in Exclude<keyof I, "value">]: never; }>(object: I): DeviceHostUploadFileSendMessage;
};
export declare const DeviceHostUploadFileInProgressReceiveValue: {
    encode(message: DeviceHostUploadFileInProgressReceiveValue, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileInProgressReceiveValue;
    fromJSON(object: any): DeviceHostUploadFileInProgressReceiveValue;
    toJSON(message: DeviceHostUploadFileInProgressReceiveValue): unknown;
    fromPartial<I extends {
        offset?: number | undefined;
    } & {
        offset?: number | undefined;
    } & { [K in Exclude<keyof I, "offset">]: never; }>(object: I): DeviceHostUploadFileInProgressReceiveValue;
};
export declare const DeviceHostUploadFileCompleteReceiveValue: {
    encode(message: DeviceHostUploadFileCompleteReceiveValue, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileCompleteReceiveValue;
    fromJSON(object: any): DeviceHostUploadFileCompleteReceiveValue;
    toJSON(message: DeviceHostUploadFileCompleteReceiveValue): unknown;
    fromPartial<I extends {
        filePath?: string | undefined;
    } & {
        filePath?: string | undefined;
    } & { [K in Exclude<keyof I, "filePath">]: never; }>(object: I): DeviceHostUploadFileCompleteReceiveValue;
};
export declare const DeviceHostUploadFileReceiveMessage: {
    encode(message: DeviceHostUploadFileReceiveMessage, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceHostUploadFileReceiveMessage;
    fromJSON(object: any): DeviceHostUploadFileReceiveMessage;
    toJSON(message: DeviceHostUploadFileReceiveMessage): unknown;
    fromPartial<I extends {
        value?: ({
            inProgress?: {
                offset?: number | undefined;
            } | undefined;
        } & {
            $case: "inProgress";
        }) | ({
            complete?: {
                filePath?: string | undefined;
            } | undefined;
        } & {
            $case: "complete";
        }) | undefined;
    } & {
        value?: ({
            inProgress?: {
                offset?: number | undefined;
            } | undefined;
        } & {
            $case: "inProgress";
        } & {
            inProgress?: ({
                offset?: number | undefined;
            } & {
                offset?: number | undefined;
            } & { [K in Exclude<keyof I["value"]["inProgress"], "offset">]: never; }) | undefined;
            $case: "inProgress";
        } & { [K_1 in Exclude<keyof I["value"], "$case" | "inProgress">]: never; }) | ({
            complete?: {
                filePath?: string | undefined;
            } | undefined;
        } & {
            $case: "complete";
        } & {
            complete?: ({
                filePath?: string | undefined;
            } & {
                filePath?: string | undefined;
            } & { [K_2 in Exclude<keyof I["value"]["complete"], "filePath">]: never; }) | undefined;
            $case: "complete";
        } & { [K_3 in Exclude<keyof I["value"], "$case" | "complete">]: never; }) | undefined;
    } & { [K_4 in Exclude<keyof I, "value">]: never; }>(object: I): DeviceHostUploadFileReceiveMessage;
};
export declare const DeviceServerResponse: {
    encode(message: DeviceServerResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DeviceServerResponse;
    fromJSON(object: any): DeviceServerResponse;
    toJSON(message: DeviceServerResponse): unknown;
    fromPartial<I extends {
        value?: ({
            error?: {
                code?: import("./errors").Code | undefined;
                message?: string | undefined;
                details?: {
                    [x: string]: any;
                } | undefined;
            } | undefined;
        } & {
            $case: "error";
        }) | ({
            data?: {
                [x: string]: any;
            } | undefined;
        } & {
            $case: "data";
        }) | undefined;
    } & {
        value?: ({
            error?: {
                code?: import("./errors").Code | undefined;
                message?: string | undefined;
                details?: {
                    [x: string]: any;
                } | undefined;
            } | undefined;
        } & {
            $case: "error";
        } & {
            error?: ({
                code?: import("./errors").Code | undefined;
                message?: string | undefined;
                details?: {
                    [x: string]: any;
                } | undefined;
            } & {
                code?: import("./errors").Code | undefined;
                message?: string | undefined;
                details?: ({
                    [x: string]: any;
                } & {
                    [x: string]: any;
                } & { [K in Exclude<keyof I["value"]["error"]["details"], string | number>]: never; }) | undefined;
            } & { [K_1 in Exclude<keyof I["value"]["error"], keyof ErrorResult>]: never; }) | undefined;
            $case: "error";
        } & { [K_2 in Exclude<keyof I["value"], "$case" | "error">]: never; }) | ({
            data?: {
                [x: string]: any;
            } | undefined;
        } & {
            $case: "data";
        } & {
            data?: ({
                [x: string]: any;
            } & {
                [x: string]: any;
            } & { [K_3 in Exclude<keyof I["value"]["data"], string | number>]: never; }) | undefined;
            $case: "data";
        } & { [K_4 in Exclude<keyof I["value"], "$case" | "data">]: never; }) | undefined;
    } & { [K_5 in Exclude<keyof I, "value">]: never; }>(object: I): DeviceServerResponse;
};
