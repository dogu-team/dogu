import _m0 from 'protobufjs/minimal';
import { ErrorResult } from './errors';
export interface HeaderValue {
    key: string;
    value: string;
}
export interface Headers {
    values: HeaderValue[];
}
export interface Body {
    value?: {
        $case: 'stringValue';
        stringValue: string;
    } | {
        $case: 'bytesValue';
        bytesValue: Uint8Array;
    };
}
export interface HttpRequest {
    protocolDomain?: string | undefined;
    method: string;
    path: string;
    headers?: Headers | undefined;
    query?: {
        [key: string]: any;
    } | undefined;
    body?: Body | undefined;
}
export interface HttpResponse {
    statusCode: number;
    headers: Headers | undefined;
    body?: Body | undefined;
    request: HttpRequest | undefined;
}
export interface HttpRequestParam {
    sequenceId: number;
    request: HttpRequest | undefined;
}
export interface HttpRequestResult {
    value?: {
        $case: 'response';
        response: HttpResponse;
    } | {
        $case: 'error';
        error: ErrorResult;
    };
}
export interface WebSocketConnection {
    protocolDomain?: string | undefined;
    path: string;
    query?: {
        [key: string]: any;
    } | undefined;
}
export interface WebSocketMessage {
    value?: {
        $case: 'stringValue';
        stringValue: string;
    } | {
        $case: 'bytesValue';
        bytesValue: Uint8Array;
    };
}
export interface WebSocketClose {
    code: number;
    reason: string;
}
export interface WebSocketParam {
    value?: {
        $case: 'connection';
        connection: WebSocketConnection;
    } | {
        $case: 'message';
        message: WebSocketMessage;
    } | {
        $case: 'close';
        close: WebSocketClose;
    };
}
export interface WebSocketOpenEvent {
}
export interface WebSocketErrorEvent {
    reason: string;
}
export interface WebSocketCloseEvent {
    code: number;
    reason: string;
}
export interface WebSocketMessageEvent {
    value?: {
        $case: 'stringValue';
        stringValue: string;
    } | {
        $case: 'bytesValue';
        bytesValue: Uint8Array;
    };
}
export interface WebSocketResult {
    value?: {
        $case: 'openEvent';
        openEvent: WebSocketOpenEvent;
    } | {
        $case: 'errorEvent';
        errorEvent: WebSocketErrorEvent;
    } | {
        $case: 'closeEvent';
        closeEvent: WebSocketCloseEvent;
    } | {
        $case: 'messageEvent';
        messageEvent: WebSocketMessageEvent;
    } | {
        $case: 'error';
        error: ErrorResult;
    };
}
export interface HttpRequestWebSocketResult {
    sequenceId: number;
    value?: {
        $case: 'httpRequestResult';
        httpRequestResult: HttpRequestResult;
    } | {
        $case: 'webSocketResult';
        webSocketResult: WebSocketResult;
    };
}
export declare const HeaderValue: {
    encode(message: HeaderValue, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): HeaderValue;
    fromJSON(object: any): HeaderValue;
    toJSON(message: HeaderValue): unknown;
    fromPartial<I extends {
        key?: string | undefined;
        value?: string | undefined;
    } & {
        key?: string | undefined;
        value?: string | undefined;
    } & { [K in Exclude<keyof I, keyof HeaderValue>]: never; }>(object: I): HeaderValue;
};
export declare const Headers: {
    encode(message: Headers, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Headers;
    fromJSON(object: any): Headers;
    toJSON(message: Headers): unknown;
    fromPartial<I extends {
        values?: {
            key?: string | undefined;
            value?: string | undefined;
        }[] | undefined;
    } & {
        values?: ({
            key?: string | undefined;
            value?: string | undefined;
        }[] & ({
            key?: string | undefined;
            value?: string | undefined;
        } & {
            key?: string | undefined;
            value?: string | undefined;
        } & { [K in Exclude<keyof I["values"][number], keyof HeaderValue>]: never; })[] & { [K_1 in Exclude<keyof I["values"], keyof {
            key?: string | undefined;
            value?: string | undefined;
        }[]>]: never; }) | undefined;
    } & { [K_2 in Exclude<keyof I, "values">]: never; }>(object: I): Headers;
};
export declare const Body: {
    encode(message: Body, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Body;
    fromJSON(object: any): Body;
    toJSON(message: Body): unknown;
    fromPartial<I extends {
        value?: ({
            stringValue?: string | undefined;
        } & {
            $case: "stringValue";
        }) | ({
            bytesValue?: Uint8Array | undefined;
        } & {
            $case: "bytesValue";
        }) | undefined;
    } & {
        value?: ({
            stringValue?: string | undefined;
        } & {
            $case: "stringValue";
        } & {
            stringValue?: string | undefined;
            $case: "stringValue";
        } & { [K in Exclude<keyof I["value"], "stringValue" | "$case">]: never; }) | ({
            bytesValue?: Uint8Array | undefined;
        } & {
            $case: "bytesValue";
        } & {
            bytesValue?: Uint8Array | undefined;
            $case: "bytesValue";
        } & { [K_1 in Exclude<keyof I["value"], "$case" | "bytesValue">]: never; }) | undefined;
    } & { [K_2 in Exclude<keyof I, "value">]: never; }>(object: I): Body;
};
export declare const HttpRequest: {
    encode(message: HttpRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): HttpRequest;
    fromJSON(object: any): HttpRequest;
    toJSON(message: HttpRequest): unknown;
    fromPartial<I extends {
        protocolDomain?: string | undefined;
        method?: string | undefined;
        path?: string | undefined;
        headers?: {
            values?: {
                key?: string | undefined;
                value?: string | undefined;
            }[] | undefined;
        } | undefined;
        query?: {
            [x: string]: any;
        } | undefined;
        body?: {
            value?: ({
                stringValue?: string | undefined;
            } & {
                $case: "stringValue";
            }) | ({
                bytesValue?: Uint8Array | undefined;
            } & {
                $case: "bytesValue";
            }) | undefined;
        } | undefined;
    } & {
        protocolDomain?: string | undefined;
        method?: string | undefined;
        path?: string | undefined;
        headers?: ({
            values?: {
                key?: string | undefined;
                value?: string | undefined;
            }[] | undefined;
        } & {
            values?: ({
                key?: string | undefined;
                value?: string | undefined;
            }[] & ({
                key?: string | undefined;
                value?: string | undefined;
            } & {
                key?: string | undefined;
                value?: string | undefined;
            } & { [K in Exclude<keyof I["headers"]["values"][number], keyof HeaderValue>]: never; })[] & { [K_1 in Exclude<keyof I["headers"]["values"], keyof {
                key?: string | undefined;
                value?: string | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_2 in Exclude<keyof I["headers"], "values">]: never; }) | undefined;
        query?: ({
            [x: string]: any;
        } & {
            [x: string]: any;
        } & { [K_3 in Exclude<keyof I["query"], string | number>]: never; }) | undefined;
        body?: ({
            value?: ({
                stringValue?: string | undefined;
            } & {
                $case: "stringValue";
            }) | ({
                bytesValue?: Uint8Array | undefined;
            } & {
                $case: "bytesValue";
            }) | undefined;
        } & {
            value?: ({
                stringValue?: string | undefined;
            } & {
                $case: "stringValue";
            } & {
                stringValue?: string | undefined;
                $case: "stringValue";
            } & { [K_4 in Exclude<keyof I["body"]["value"], "stringValue" | "$case">]: never; }) | ({
                bytesValue?: Uint8Array | undefined;
            } & {
                $case: "bytesValue";
            } & {
                bytesValue?: Uint8Array | undefined;
                $case: "bytesValue";
            } & { [K_5 in Exclude<keyof I["body"]["value"], "$case" | "bytesValue">]: never; }) | undefined;
        } & { [K_6 in Exclude<keyof I["body"], "value">]: never; }) | undefined;
    } & { [K_7 in Exclude<keyof I, keyof HttpRequest>]: never; }>(object: I): HttpRequest;
};
export declare const HttpResponse: {
    encode(message: HttpResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): HttpResponse;
    fromJSON(object: any): HttpResponse;
    toJSON(message: HttpResponse): unknown;
    fromPartial<I extends {
        statusCode?: number | undefined;
        headers?: {
            values?: {
                key?: string | undefined;
                value?: string | undefined;
            }[] | undefined;
        } | undefined;
        body?: {
            value?: ({
                stringValue?: string | undefined;
            } & {
                $case: "stringValue";
            }) | ({
                bytesValue?: Uint8Array | undefined;
            } & {
                $case: "bytesValue";
            }) | undefined;
        } | undefined;
        request?: {
            protocolDomain?: string | undefined;
            method?: string | undefined;
            path?: string | undefined;
            headers?: {
                values?: {
                    key?: string | undefined;
                    value?: string | undefined;
                }[] | undefined;
            } | undefined;
            query?: {
                [x: string]: any;
            } | undefined;
            body?: {
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                }) | undefined;
            } | undefined;
        } | undefined;
    } & {
        statusCode?: number | undefined;
        headers?: ({
            values?: {
                key?: string | undefined;
                value?: string | undefined;
            }[] | undefined;
        } & {
            values?: ({
                key?: string | undefined;
                value?: string | undefined;
            }[] & ({
                key?: string | undefined;
                value?: string | undefined;
            } & {
                key?: string | undefined;
                value?: string | undefined;
            } & { [K in Exclude<keyof I["headers"]["values"][number], keyof HeaderValue>]: never; })[] & { [K_1 in Exclude<keyof I["headers"]["values"], keyof {
                key?: string | undefined;
                value?: string | undefined;
            }[]>]: never; }) | undefined;
        } & { [K_2 in Exclude<keyof I["headers"], "values">]: never; }) | undefined;
        body?: ({
            value?: ({
                stringValue?: string | undefined;
            } & {
                $case: "stringValue";
            }) | ({
                bytesValue?: Uint8Array | undefined;
            } & {
                $case: "bytesValue";
            }) | undefined;
        } & {
            value?: ({
                stringValue?: string | undefined;
            } & {
                $case: "stringValue";
            } & {
                stringValue?: string | undefined;
                $case: "stringValue";
            } & { [K_3 in Exclude<keyof I["body"]["value"], "stringValue" | "$case">]: never; }) | ({
                bytesValue?: Uint8Array | undefined;
            } & {
                $case: "bytesValue";
            } & {
                bytesValue?: Uint8Array | undefined;
                $case: "bytesValue";
            } & { [K_4 in Exclude<keyof I["body"]["value"], "$case" | "bytesValue">]: never; }) | undefined;
        } & { [K_5 in Exclude<keyof I["body"], "value">]: never; }) | undefined;
        request?: ({
            protocolDomain?: string | undefined;
            method?: string | undefined;
            path?: string | undefined;
            headers?: {
                values?: {
                    key?: string | undefined;
                    value?: string | undefined;
                }[] | undefined;
            } | undefined;
            query?: {
                [x: string]: any;
            } | undefined;
            body?: {
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                }) | undefined;
            } | undefined;
        } & {
            protocolDomain?: string | undefined;
            method?: string | undefined;
            path?: string | undefined;
            headers?: ({
                values?: {
                    key?: string | undefined;
                    value?: string | undefined;
                }[] | undefined;
            } & {
                values?: ({
                    key?: string | undefined;
                    value?: string | undefined;
                }[] & ({
                    key?: string | undefined;
                    value?: string | undefined;
                } & {
                    key?: string | undefined;
                    value?: string | undefined;
                } & { [K_6 in Exclude<keyof I["request"]["headers"]["values"][number], keyof HeaderValue>]: never; })[] & { [K_7 in Exclude<keyof I["request"]["headers"]["values"], keyof {
                    key?: string | undefined;
                    value?: string | undefined;
                }[]>]: never; }) | undefined;
            } & { [K_8 in Exclude<keyof I["request"]["headers"], "values">]: never; }) | undefined;
            query?: ({
                [x: string]: any;
            } & {
                [x: string]: any;
            } & { [K_9 in Exclude<keyof I["request"]["query"], string | number>]: never; }) | undefined;
            body?: ({
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                }) | undefined;
            } & {
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                } & {
                    stringValue?: string | undefined;
                    $case: "stringValue";
                } & { [K_10 in Exclude<keyof I["request"]["body"]["value"], "stringValue" | "$case">]: never; }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                } & {
                    bytesValue?: Uint8Array | undefined;
                    $case: "bytesValue";
                } & { [K_11 in Exclude<keyof I["request"]["body"]["value"], "$case" | "bytesValue">]: never; }) | undefined;
            } & { [K_12 in Exclude<keyof I["request"]["body"], "value">]: never; }) | undefined;
        } & { [K_13 in Exclude<keyof I["request"], keyof HttpRequest>]: never; }) | undefined;
    } & { [K_14 in Exclude<keyof I, keyof HttpResponse>]: never; }>(object: I): HttpResponse;
};
export declare const HttpRequestParam: {
    encode(message: HttpRequestParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): HttpRequestParam;
    fromJSON(object: any): HttpRequestParam;
    toJSON(message: HttpRequestParam): unknown;
    fromPartial<I extends {
        sequenceId?: number | undefined;
        request?: {
            protocolDomain?: string | undefined;
            method?: string | undefined;
            path?: string | undefined;
            headers?: {
                values?: {
                    key?: string | undefined;
                    value?: string | undefined;
                }[] | undefined;
            } | undefined;
            query?: {
                [x: string]: any;
            } | undefined;
            body?: {
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                }) | undefined;
            } | undefined;
        } | undefined;
    } & {
        sequenceId?: number | undefined;
        request?: ({
            protocolDomain?: string | undefined;
            method?: string | undefined;
            path?: string | undefined;
            headers?: {
                values?: {
                    key?: string | undefined;
                    value?: string | undefined;
                }[] | undefined;
            } | undefined;
            query?: {
                [x: string]: any;
            } | undefined;
            body?: {
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                }) | undefined;
            } | undefined;
        } & {
            protocolDomain?: string | undefined;
            method?: string | undefined;
            path?: string | undefined;
            headers?: ({
                values?: {
                    key?: string | undefined;
                    value?: string | undefined;
                }[] | undefined;
            } & {
                values?: ({
                    key?: string | undefined;
                    value?: string | undefined;
                }[] & ({
                    key?: string | undefined;
                    value?: string | undefined;
                } & {
                    key?: string | undefined;
                    value?: string | undefined;
                } & { [K in Exclude<keyof I["request"]["headers"]["values"][number], keyof HeaderValue>]: never; })[] & { [K_1 in Exclude<keyof I["request"]["headers"]["values"], keyof {
                    key?: string | undefined;
                    value?: string | undefined;
                }[]>]: never; }) | undefined;
            } & { [K_2 in Exclude<keyof I["request"]["headers"], "values">]: never; }) | undefined;
            query?: ({
                [x: string]: any;
            } & {
                [x: string]: any;
            } & { [K_3 in Exclude<keyof I["request"]["query"], string | number>]: never; }) | undefined;
            body?: ({
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                }) | undefined;
            } & {
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                } & {
                    stringValue?: string | undefined;
                    $case: "stringValue";
                } & { [K_4 in Exclude<keyof I["request"]["body"]["value"], "stringValue" | "$case">]: never; }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                } & {
                    bytesValue?: Uint8Array | undefined;
                    $case: "bytesValue";
                } & { [K_5 in Exclude<keyof I["request"]["body"]["value"], "$case" | "bytesValue">]: never; }) | undefined;
            } & { [K_6 in Exclude<keyof I["request"]["body"], "value">]: never; }) | undefined;
        } & { [K_7 in Exclude<keyof I["request"], keyof HttpRequest>]: never; }) | undefined;
    } & { [K_8 in Exclude<keyof I, keyof HttpRequestParam>]: never; }>(object: I): HttpRequestParam;
};
export declare const HttpRequestResult: {
    encode(message: HttpRequestResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): HttpRequestResult;
    fromJSON(object: any): HttpRequestResult;
    toJSON(message: HttpRequestResult): unknown;
    fromPartial<I extends {
        value?: ({
            response?: {
                statusCode?: number | undefined;
                headers?: {
                    values?: {
                        key?: string | undefined;
                        value?: string | undefined;
                    }[] | undefined;
                } | undefined;
                body?: {
                    value?: ({
                        stringValue?: string | undefined;
                    } & {
                        $case: "stringValue";
                    }) | ({
                        bytesValue?: Uint8Array | undefined;
                    } & {
                        $case: "bytesValue";
                    }) | undefined;
                } | undefined;
                request?: {
                    protocolDomain?: string | undefined;
                    method?: string | undefined;
                    path?: string | undefined;
                    headers?: {
                        values?: {
                            key?: string | undefined;
                            value?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    query?: {
                        [x: string]: any;
                    } | undefined;
                    body?: {
                        value?: ({
                            stringValue?: string | undefined;
                        } & {
                            $case: "stringValue";
                        }) | ({
                            bytesValue?: Uint8Array | undefined;
                        } & {
                            $case: "bytesValue";
                        }) | undefined;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "response";
        }) | ({
            error?: {
                code?: import("./errors").Code | undefined;
                message?: string | undefined;
                details?: {
                    [x: string]: any;
                } | undefined;
            } | undefined;
        } & {
            $case: "error";
        }) | undefined;
    } & {
        value?: ({
            response?: {
                statusCode?: number | undefined;
                headers?: {
                    values?: {
                        key?: string | undefined;
                        value?: string | undefined;
                    }[] | undefined;
                } | undefined;
                body?: {
                    value?: ({
                        stringValue?: string | undefined;
                    } & {
                        $case: "stringValue";
                    }) | ({
                        bytesValue?: Uint8Array | undefined;
                    } & {
                        $case: "bytesValue";
                    }) | undefined;
                } | undefined;
                request?: {
                    protocolDomain?: string | undefined;
                    method?: string | undefined;
                    path?: string | undefined;
                    headers?: {
                        values?: {
                            key?: string | undefined;
                            value?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    query?: {
                        [x: string]: any;
                    } | undefined;
                    body?: {
                        value?: ({
                            stringValue?: string | undefined;
                        } & {
                            $case: "stringValue";
                        }) | ({
                            bytesValue?: Uint8Array | undefined;
                        } & {
                            $case: "bytesValue";
                        }) | undefined;
                    } | undefined;
                } | undefined;
            } | undefined;
        } & {
            $case: "response";
        } & {
            response?: ({
                statusCode?: number | undefined;
                headers?: {
                    values?: {
                        key?: string | undefined;
                        value?: string | undefined;
                    }[] | undefined;
                } | undefined;
                body?: {
                    value?: ({
                        stringValue?: string | undefined;
                    } & {
                        $case: "stringValue";
                    }) | ({
                        bytesValue?: Uint8Array | undefined;
                    } & {
                        $case: "bytesValue";
                    }) | undefined;
                } | undefined;
                request?: {
                    protocolDomain?: string | undefined;
                    method?: string | undefined;
                    path?: string | undefined;
                    headers?: {
                        values?: {
                            key?: string | undefined;
                            value?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    query?: {
                        [x: string]: any;
                    } | undefined;
                    body?: {
                        value?: ({
                            stringValue?: string | undefined;
                        } & {
                            $case: "stringValue";
                        }) | ({
                            bytesValue?: Uint8Array | undefined;
                        } & {
                            $case: "bytesValue";
                        }) | undefined;
                    } | undefined;
                } | undefined;
            } & {
                statusCode?: number | undefined;
                headers?: ({
                    values?: {
                        key?: string | undefined;
                        value?: string | undefined;
                    }[] | undefined;
                } & {
                    values?: ({
                        key?: string | undefined;
                        value?: string | undefined;
                    }[] & ({
                        key?: string | undefined;
                        value?: string | undefined;
                    } & {
                        key?: string | undefined;
                        value?: string | undefined;
                    } & { [K in Exclude<keyof I["value"]["response"]["headers"]["values"][number], keyof HeaderValue>]: never; })[] & { [K_1 in Exclude<keyof I["value"]["response"]["headers"]["values"], keyof {
                        key?: string | undefined;
                        value?: string | undefined;
                    }[]>]: never; }) | undefined;
                } & { [K_2 in Exclude<keyof I["value"]["response"]["headers"], "values">]: never; }) | undefined;
                body?: ({
                    value?: ({
                        stringValue?: string | undefined;
                    } & {
                        $case: "stringValue";
                    }) | ({
                        bytesValue?: Uint8Array | undefined;
                    } & {
                        $case: "bytesValue";
                    }) | undefined;
                } & {
                    value?: ({
                        stringValue?: string | undefined;
                    } & {
                        $case: "stringValue";
                    } & {
                        stringValue?: string | undefined;
                        $case: "stringValue";
                    } & { [K_3 in Exclude<keyof I["value"]["response"]["body"]["value"], "stringValue" | "$case">]: never; }) | ({
                        bytesValue?: Uint8Array | undefined;
                    } & {
                        $case: "bytesValue";
                    } & {
                        bytesValue?: Uint8Array | undefined;
                        $case: "bytesValue";
                    } & { [K_4 in Exclude<keyof I["value"]["response"]["body"]["value"], "$case" | "bytesValue">]: never; }) | undefined;
                } & { [K_5 in Exclude<keyof I["value"]["response"]["body"], "value">]: never; }) | undefined;
                request?: ({
                    protocolDomain?: string | undefined;
                    method?: string | undefined;
                    path?: string | undefined;
                    headers?: {
                        values?: {
                            key?: string | undefined;
                            value?: string | undefined;
                        }[] | undefined;
                    } | undefined;
                    query?: {
                        [x: string]: any;
                    } | undefined;
                    body?: {
                        value?: ({
                            stringValue?: string | undefined;
                        } & {
                            $case: "stringValue";
                        }) | ({
                            bytesValue?: Uint8Array | undefined;
                        } & {
                            $case: "bytesValue";
                        }) | undefined;
                    } | undefined;
                } & {
                    protocolDomain?: string | undefined;
                    method?: string | undefined;
                    path?: string | undefined;
                    headers?: ({
                        values?: {
                            key?: string | undefined;
                            value?: string | undefined;
                        }[] | undefined;
                    } & {
                        values?: ({
                            key?: string | undefined;
                            value?: string | undefined;
                        }[] & ({
                            key?: string | undefined;
                            value?: string | undefined;
                        } & {
                            key?: string | undefined;
                            value?: string | undefined;
                        } & { [K_6 in Exclude<keyof I["value"]["response"]["request"]["headers"]["values"][number], keyof HeaderValue>]: never; })[] & { [K_7 in Exclude<keyof I["value"]["response"]["request"]["headers"]["values"], keyof {
                            key?: string | undefined;
                            value?: string | undefined;
                        }[]>]: never; }) | undefined;
                    } & { [K_8 in Exclude<keyof I["value"]["response"]["request"]["headers"], "values">]: never; }) | undefined;
                    query?: ({
                        [x: string]: any;
                    } & {
                        [x: string]: any;
                    } & { [K_9 in Exclude<keyof I["value"]["response"]["request"]["query"], string | number>]: never; }) | undefined;
                    body?: ({
                        value?: ({
                            stringValue?: string | undefined;
                        } & {
                            $case: "stringValue";
                        }) | ({
                            bytesValue?: Uint8Array | undefined;
                        } & {
                            $case: "bytesValue";
                        }) | undefined;
                    } & {
                        value?: ({
                            stringValue?: string | undefined;
                        } & {
                            $case: "stringValue";
                        } & {
                            stringValue?: string | undefined;
                            $case: "stringValue";
                        } & { [K_10 in Exclude<keyof I["value"]["response"]["request"]["body"]["value"], "stringValue" | "$case">]: never; }) | ({
                            bytesValue?: Uint8Array | undefined;
                        } & {
                            $case: "bytesValue";
                        } & {
                            bytesValue?: Uint8Array | undefined;
                            $case: "bytesValue";
                        } & { [K_11 in Exclude<keyof I["value"]["response"]["request"]["body"]["value"], "$case" | "bytesValue">]: never; }) | undefined;
                    } & { [K_12 in Exclude<keyof I["value"]["response"]["request"]["body"], "value">]: never; }) | undefined;
                } & { [K_13 in Exclude<keyof I["value"]["response"]["request"], keyof HttpRequest>]: never; }) | undefined;
            } & { [K_14 in Exclude<keyof I["value"]["response"], keyof HttpResponse>]: never; }) | undefined;
            $case: "response";
        } & { [K_15 in Exclude<keyof I["value"], "$case" | "response">]: never; }) | ({
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
                } & { [K_16 in Exclude<keyof I["value"]["error"]["details"], string | number>]: never; }) | undefined;
            } & { [K_17 in Exclude<keyof I["value"]["error"], keyof ErrorResult>]: never; }) | undefined;
            $case: "error";
        } & { [K_18 in Exclude<keyof I["value"], "$case" | "error">]: never; }) | undefined;
    } & { [K_19 in Exclude<keyof I, "value">]: never; }>(object: I): HttpRequestResult;
};
export declare const WebSocketConnection: {
    encode(message: WebSocketConnection, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketConnection;
    fromJSON(object: any): WebSocketConnection;
    toJSON(message: WebSocketConnection): unknown;
    fromPartial<I extends {
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
        } & { [K in Exclude<keyof I["query"], string | number>]: never; }) | undefined;
    } & { [K_1 in Exclude<keyof I, keyof WebSocketConnection>]: never; }>(object: I): WebSocketConnection;
};
export declare const WebSocketMessage: {
    encode(message: WebSocketMessage, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketMessage;
    fromJSON(object: any): WebSocketMessage;
    toJSON(message: WebSocketMessage): unknown;
    fromPartial<I extends {
        value?: ({
            stringValue?: string | undefined;
        } & {
            $case: "stringValue";
        }) | ({
            bytesValue?: Uint8Array | undefined;
        } & {
            $case: "bytesValue";
        }) | undefined;
    } & {
        value?: ({
            stringValue?: string | undefined;
        } & {
            $case: "stringValue";
        } & {
            stringValue?: string | undefined;
            $case: "stringValue";
        } & { [K in Exclude<keyof I["value"], "stringValue" | "$case">]: never; }) | ({
            bytesValue?: Uint8Array | undefined;
        } & {
            $case: "bytesValue";
        } & {
            bytesValue?: Uint8Array | undefined;
            $case: "bytesValue";
        } & { [K_1 in Exclude<keyof I["value"], "$case" | "bytesValue">]: never; }) | undefined;
    } & { [K_2 in Exclude<keyof I, "value">]: never; }>(object: I): WebSocketMessage;
};
export declare const WebSocketClose: {
    encode(message: WebSocketClose, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketClose;
    fromJSON(object: any): WebSocketClose;
    toJSON(message: WebSocketClose): unknown;
    fromPartial<I extends {
        code?: number | undefined;
        reason?: string | undefined;
    } & {
        code?: number | undefined;
        reason?: string | undefined;
    } & { [K in Exclude<keyof I, keyof WebSocketClose>]: never; }>(object: I): WebSocketClose;
};
export declare const WebSocketParam: {
    encode(message: WebSocketParam, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketParam;
    fromJSON(object: any): WebSocketParam;
    toJSON(message: WebSocketParam): unknown;
    fromPartial<I extends {
        value?: ({
            connection?: {
                protocolDomain?: string | undefined;
                path?: string | undefined;
                query?: {
                    [x: string]: any;
                } | undefined;
            } | undefined;
        } & {
            $case: "connection";
        }) | ({
            message?: {
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                }) | undefined;
            } | undefined;
        } & {
            $case: "message";
        }) | ({
            close?: {
                code?: number | undefined;
                reason?: string | undefined;
            } | undefined;
        } & {
            $case: "close";
        }) | undefined;
    } & {
        value?: ({
            connection?: {
                protocolDomain?: string | undefined;
                path?: string | undefined;
                query?: {
                    [x: string]: any;
                } | undefined;
            } | undefined;
        } & {
            $case: "connection";
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
                } & { [K in Exclude<keyof I["value"]["connection"]["query"], string | number>]: never; }) | undefined;
            } & { [K_1 in Exclude<keyof I["value"]["connection"], keyof WebSocketConnection>]: never; }) | undefined;
            $case: "connection";
        } & { [K_2 in Exclude<keyof I["value"], "$case" | "connection">]: never; }) | ({
            message?: {
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                }) | undefined;
            } | undefined;
        } & {
            $case: "message";
        } & {
            message?: ({
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                }) | undefined;
            } & {
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                } & {
                    stringValue?: string | undefined;
                    $case: "stringValue";
                } & { [K_3 in Exclude<keyof I["value"]["message"]["value"], "stringValue" | "$case">]: never; }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                } & {
                    bytesValue?: Uint8Array | undefined;
                    $case: "bytesValue";
                } & { [K_4 in Exclude<keyof I["value"]["message"]["value"], "$case" | "bytesValue">]: never; }) | undefined;
            } & { [K_5 in Exclude<keyof I["value"]["message"], "value">]: never; }) | undefined;
            $case: "message";
        } & { [K_6 in Exclude<keyof I["value"], "$case" | "message">]: never; }) | ({
            close?: {
                code?: number | undefined;
                reason?: string | undefined;
            } | undefined;
        } & {
            $case: "close";
        } & {
            close?: ({
                code?: number | undefined;
                reason?: string | undefined;
            } & {
                code?: number | undefined;
                reason?: string | undefined;
            } & { [K_7 in Exclude<keyof I["value"]["close"], keyof WebSocketClose>]: never; }) | undefined;
            $case: "close";
        } & { [K_8 in Exclude<keyof I["value"], "$case" | "close">]: never; }) | undefined;
    } & { [K_9 in Exclude<keyof I, "value">]: never; }>(object: I): WebSocketParam;
};
export declare const WebSocketOpenEvent: {
    encode(_: WebSocketOpenEvent, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketOpenEvent;
    fromJSON(_: any): WebSocketOpenEvent;
    toJSON(_: WebSocketOpenEvent): unknown;
    fromPartial<I extends {} & {} & { [K in Exclude<keyof I, never>]: never; }>(_: I): WebSocketOpenEvent;
};
export declare const WebSocketErrorEvent: {
    encode(message: WebSocketErrorEvent, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketErrorEvent;
    fromJSON(object: any): WebSocketErrorEvent;
    toJSON(message: WebSocketErrorEvent): unknown;
    fromPartial<I extends {
        reason?: string | undefined;
    } & {
        reason?: string | undefined;
    } & { [K in Exclude<keyof I, "reason">]: never; }>(object: I): WebSocketErrorEvent;
};
export declare const WebSocketCloseEvent: {
    encode(message: WebSocketCloseEvent, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketCloseEvent;
    fromJSON(object: any): WebSocketCloseEvent;
    toJSON(message: WebSocketCloseEvent): unknown;
    fromPartial<I extends {
        code?: number | undefined;
        reason?: string | undefined;
    } & {
        code?: number | undefined;
        reason?: string | undefined;
    } & { [K in Exclude<keyof I, keyof WebSocketCloseEvent>]: never; }>(object: I): WebSocketCloseEvent;
};
export declare const WebSocketMessageEvent: {
    encode(message: WebSocketMessageEvent, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketMessageEvent;
    fromJSON(object: any): WebSocketMessageEvent;
    toJSON(message: WebSocketMessageEvent): unknown;
    fromPartial<I extends {
        value?: ({
            stringValue?: string | undefined;
        } & {
            $case: "stringValue";
        }) | ({
            bytesValue?: Uint8Array | undefined;
        } & {
            $case: "bytesValue";
        }) | undefined;
    } & {
        value?: ({
            stringValue?: string | undefined;
        } & {
            $case: "stringValue";
        } & {
            stringValue?: string | undefined;
            $case: "stringValue";
        } & { [K in Exclude<keyof I["value"], "stringValue" | "$case">]: never; }) | ({
            bytesValue?: Uint8Array | undefined;
        } & {
            $case: "bytesValue";
        } & {
            bytesValue?: Uint8Array | undefined;
            $case: "bytesValue";
        } & { [K_1 in Exclude<keyof I["value"], "$case" | "bytesValue">]: never; }) | undefined;
    } & { [K_2 in Exclude<keyof I, "value">]: never; }>(object: I): WebSocketMessageEvent;
};
export declare const WebSocketResult: {
    encode(message: WebSocketResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WebSocketResult;
    fromJSON(object: any): WebSocketResult;
    toJSON(message: WebSocketResult): unknown;
    fromPartial<I extends {
        value?: ({
            openEvent?: {} | undefined;
        } & {
            $case: "openEvent";
        }) | ({
            errorEvent?: {
                reason?: string | undefined;
            } | undefined;
        } & {
            $case: "errorEvent";
        }) | ({
            closeEvent?: {
                code?: number | undefined;
                reason?: string | undefined;
            } | undefined;
        } & {
            $case: "closeEvent";
        }) | ({
            messageEvent?: {
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                }) | undefined;
            } | undefined;
        } & {
            $case: "messageEvent";
        }) | ({
            error?: {
                code?: import("./errors").Code | undefined;
                message?: string | undefined;
                details?: {
                    [x: string]: any;
                } | undefined;
            } | undefined;
        } & {
            $case: "error";
        }) | undefined;
    } & {
        value?: ({
            openEvent?: {} | undefined;
        } & {
            $case: "openEvent";
        } & {
            openEvent?: ({} & {} & { [K in Exclude<keyof I["value"]["openEvent"], never>]: never; }) | undefined;
            $case: "openEvent";
        } & { [K_1 in Exclude<keyof I["value"], "$case" | "openEvent">]: never; }) | ({
            errorEvent?: {
                reason?: string | undefined;
            } | undefined;
        } & {
            $case: "errorEvent";
        } & {
            errorEvent?: ({
                reason?: string | undefined;
            } & {
                reason?: string | undefined;
            } & { [K_2 in Exclude<keyof I["value"]["errorEvent"], "reason">]: never; }) | undefined;
            $case: "errorEvent";
        } & { [K_3 in Exclude<keyof I["value"], "$case" | "errorEvent">]: never; }) | ({
            closeEvent?: {
                code?: number | undefined;
                reason?: string | undefined;
            } | undefined;
        } & {
            $case: "closeEvent";
        } & {
            closeEvent?: ({
                code?: number | undefined;
                reason?: string | undefined;
            } & {
                code?: number | undefined;
                reason?: string | undefined;
            } & { [K_4 in Exclude<keyof I["value"]["closeEvent"], keyof WebSocketCloseEvent>]: never; }) | undefined;
            $case: "closeEvent";
        } & { [K_5 in Exclude<keyof I["value"], "$case" | "closeEvent">]: never; }) | ({
            messageEvent?: {
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                }) | undefined;
            } | undefined;
        } & {
            $case: "messageEvent";
        } & {
            messageEvent?: ({
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                }) | undefined;
            } & {
                value?: ({
                    stringValue?: string | undefined;
                } & {
                    $case: "stringValue";
                } & {
                    stringValue?: string | undefined;
                    $case: "stringValue";
                } & { [K_6 in Exclude<keyof I["value"]["messageEvent"]["value"], "stringValue" | "$case">]: never; }) | ({
                    bytesValue?: Uint8Array | undefined;
                } & {
                    $case: "bytesValue";
                } & {
                    bytesValue?: Uint8Array | undefined;
                    $case: "bytesValue";
                } & { [K_7 in Exclude<keyof I["value"]["messageEvent"]["value"], "$case" | "bytesValue">]: never; }) | undefined;
            } & { [K_8 in Exclude<keyof I["value"]["messageEvent"], "value">]: never; }) | undefined;
            $case: "messageEvent";
        } & { [K_9 in Exclude<keyof I["value"], "$case" | "messageEvent">]: never; }) | ({
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
                } & { [K_10 in Exclude<keyof I["value"]["error"]["details"], string | number>]: never; }) | undefined;
            } & { [K_11 in Exclude<keyof I["value"]["error"], keyof ErrorResult>]: never; }) | undefined;
            $case: "error";
        } & { [K_12 in Exclude<keyof I["value"], "$case" | "error">]: never; }) | undefined;
    } & { [K_13 in Exclude<keyof I, "value">]: never; }>(object: I): WebSocketResult;
};
export declare const HttpRequestWebSocketResult: {
    encode(message: HttpRequestWebSocketResult, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): HttpRequestWebSocketResult;
    fromJSON(object: any): HttpRequestWebSocketResult;
    toJSON(message: HttpRequestWebSocketResult): unknown;
    fromPartial<I extends {
        sequenceId?: number | undefined;
        value?: ({
            httpRequestResult?: {
                value?: ({
                    response?: {
                        statusCode?: number | undefined;
                        headers?: {
                            values?: {
                                key?: string | undefined;
                                value?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        body?: {
                            value?: ({
                                stringValue?: string | undefined;
                            } & {
                                $case: "stringValue";
                            }) | ({
                                bytesValue?: Uint8Array | undefined;
                            } & {
                                $case: "bytesValue";
                            }) | undefined;
                        } | undefined;
                        request?: {
                            protocolDomain?: string | undefined;
                            method?: string | undefined;
                            path?: string | undefined;
                            headers?: {
                                values?: {
                                    key?: string | undefined;
                                    value?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            query?: {
                                [x: string]: any;
                            } | undefined;
                            body?: {
                                value?: ({
                                    stringValue?: string | undefined;
                                } & {
                                    $case: "stringValue";
                                }) | ({
                                    bytesValue?: Uint8Array | undefined;
                                } & {
                                    $case: "bytesValue";
                                }) | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                } & {
                    $case: "response";
                }) | ({
                    error?: {
                        code?: import("./errors").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } & {
                    $case: "error";
                }) | undefined;
            } | undefined;
        } & {
            $case: "httpRequestResult";
        }) | ({
            webSocketResult?: {
                value?: ({
                    openEvent?: {} | undefined;
                } & {
                    $case: "openEvent";
                }) | ({
                    errorEvent?: {
                        reason?: string | undefined;
                    } | undefined;
                } & {
                    $case: "errorEvent";
                }) | ({
                    closeEvent?: {
                        code?: number | undefined;
                        reason?: string | undefined;
                    } | undefined;
                } & {
                    $case: "closeEvent";
                }) | ({
                    messageEvent?: {
                        value?: ({
                            stringValue?: string | undefined;
                        } & {
                            $case: "stringValue";
                        }) | ({
                            bytesValue?: Uint8Array | undefined;
                        } & {
                            $case: "bytesValue";
                        }) | undefined;
                    } | undefined;
                } & {
                    $case: "messageEvent";
                }) | ({
                    error?: {
                        code?: import("./errors").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } & {
                    $case: "error";
                }) | undefined;
            } | undefined;
        } & {
            $case: "webSocketResult";
        }) | undefined;
    } & {
        sequenceId?: number | undefined;
        value?: ({
            httpRequestResult?: {
                value?: ({
                    response?: {
                        statusCode?: number | undefined;
                        headers?: {
                            values?: {
                                key?: string | undefined;
                                value?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        body?: {
                            value?: ({
                                stringValue?: string | undefined;
                            } & {
                                $case: "stringValue";
                            }) | ({
                                bytesValue?: Uint8Array | undefined;
                            } & {
                                $case: "bytesValue";
                            }) | undefined;
                        } | undefined;
                        request?: {
                            protocolDomain?: string | undefined;
                            method?: string | undefined;
                            path?: string | undefined;
                            headers?: {
                                values?: {
                                    key?: string | undefined;
                                    value?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            query?: {
                                [x: string]: any;
                            } | undefined;
                            body?: {
                                value?: ({
                                    stringValue?: string | undefined;
                                } & {
                                    $case: "stringValue";
                                }) | ({
                                    bytesValue?: Uint8Array | undefined;
                                } & {
                                    $case: "bytesValue";
                                }) | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                } & {
                    $case: "response";
                }) | ({
                    error?: {
                        code?: import("./errors").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } & {
                    $case: "error";
                }) | undefined;
            } | undefined;
        } & {
            $case: "httpRequestResult";
        } & {
            httpRequestResult?: ({
                value?: ({
                    response?: {
                        statusCode?: number | undefined;
                        headers?: {
                            values?: {
                                key?: string | undefined;
                                value?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        body?: {
                            value?: ({
                                stringValue?: string | undefined;
                            } & {
                                $case: "stringValue";
                            }) | ({
                                bytesValue?: Uint8Array | undefined;
                            } & {
                                $case: "bytesValue";
                            }) | undefined;
                        } | undefined;
                        request?: {
                            protocolDomain?: string | undefined;
                            method?: string | undefined;
                            path?: string | undefined;
                            headers?: {
                                values?: {
                                    key?: string | undefined;
                                    value?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            query?: {
                                [x: string]: any;
                            } | undefined;
                            body?: {
                                value?: ({
                                    stringValue?: string | undefined;
                                } & {
                                    $case: "stringValue";
                                }) | ({
                                    bytesValue?: Uint8Array | undefined;
                                } & {
                                    $case: "bytesValue";
                                }) | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                } & {
                    $case: "response";
                }) | ({
                    error?: {
                        code?: import("./errors").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } & {
                    $case: "error";
                }) | undefined;
            } & {
                value?: ({
                    response?: {
                        statusCode?: number | undefined;
                        headers?: {
                            values?: {
                                key?: string | undefined;
                                value?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        body?: {
                            value?: ({
                                stringValue?: string | undefined;
                            } & {
                                $case: "stringValue";
                            }) | ({
                                bytesValue?: Uint8Array | undefined;
                            } & {
                                $case: "bytesValue";
                            }) | undefined;
                        } | undefined;
                        request?: {
                            protocolDomain?: string | undefined;
                            method?: string | undefined;
                            path?: string | undefined;
                            headers?: {
                                values?: {
                                    key?: string | undefined;
                                    value?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            query?: {
                                [x: string]: any;
                            } | undefined;
                            body?: {
                                value?: ({
                                    stringValue?: string | undefined;
                                } & {
                                    $case: "stringValue";
                                }) | ({
                                    bytesValue?: Uint8Array | undefined;
                                } & {
                                    $case: "bytesValue";
                                }) | undefined;
                            } | undefined;
                        } | undefined;
                    } | undefined;
                } & {
                    $case: "response";
                } & {
                    response?: ({
                        statusCode?: number | undefined;
                        headers?: {
                            values?: {
                                key?: string | undefined;
                                value?: string | undefined;
                            }[] | undefined;
                        } | undefined;
                        body?: {
                            value?: ({
                                stringValue?: string | undefined;
                            } & {
                                $case: "stringValue";
                            }) | ({
                                bytesValue?: Uint8Array | undefined;
                            } & {
                                $case: "bytesValue";
                            }) | undefined;
                        } | undefined;
                        request?: {
                            protocolDomain?: string | undefined;
                            method?: string | undefined;
                            path?: string | undefined;
                            headers?: {
                                values?: {
                                    key?: string | undefined;
                                    value?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            query?: {
                                [x: string]: any;
                            } | undefined;
                            body?: {
                                value?: ({
                                    stringValue?: string | undefined;
                                } & {
                                    $case: "stringValue";
                                }) | ({
                                    bytesValue?: Uint8Array | undefined;
                                } & {
                                    $case: "bytesValue";
                                }) | undefined;
                            } | undefined;
                        } | undefined;
                    } & {
                        statusCode?: number | undefined;
                        headers?: ({
                            values?: {
                                key?: string | undefined;
                                value?: string | undefined;
                            }[] | undefined;
                        } & {
                            values?: ({
                                key?: string | undefined;
                                value?: string | undefined;
                            }[] & ({
                                key?: string | undefined;
                                value?: string | undefined;
                            } & {
                                key?: string | undefined;
                                value?: string | undefined;
                            } & { [K in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["headers"]["values"][number], keyof HeaderValue>]: never; })[] & { [K_1 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["headers"]["values"], keyof {
                                key?: string | undefined;
                                value?: string | undefined;
                            }[]>]: never; }) | undefined;
                        } & { [K_2 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["headers"], "values">]: never; }) | undefined;
                        body?: ({
                            value?: ({
                                stringValue?: string | undefined;
                            } & {
                                $case: "stringValue";
                            }) | ({
                                bytesValue?: Uint8Array | undefined;
                            } & {
                                $case: "bytesValue";
                            }) | undefined;
                        } & {
                            value?: ({
                                stringValue?: string | undefined;
                            } & {
                                $case: "stringValue";
                            } & {
                                stringValue?: string | undefined;
                                $case: "stringValue";
                            } & { [K_3 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["body"]["value"], "stringValue" | "$case">]: never; }) | ({
                                bytesValue?: Uint8Array | undefined;
                            } & {
                                $case: "bytesValue";
                            } & {
                                bytesValue?: Uint8Array | undefined;
                                $case: "bytesValue";
                            } & { [K_4 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["body"]["value"], "$case" | "bytesValue">]: never; }) | undefined;
                        } & { [K_5 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["body"], "value">]: never; }) | undefined;
                        request?: ({
                            protocolDomain?: string | undefined;
                            method?: string | undefined;
                            path?: string | undefined;
                            headers?: {
                                values?: {
                                    key?: string | undefined;
                                    value?: string | undefined;
                                }[] | undefined;
                            } | undefined;
                            query?: {
                                [x: string]: any;
                            } | undefined;
                            body?: {
                                value?: ({
                                    stringValue?: string | undefined;
                                } & {
                                    $case: "stringValue";
                                }) | ({
                                    bytesValue?: Uint8Array | undefined;
                                } & {
                                    $case: "bytesValue";
                                }) | undefined;
                            } | undefined;
                        } & {
                            protocolDomain?: string | undefined;
                            method?: string | undefined;
                            path?: string | undefined;
                            headers?: ({
                                values?: {
                                    key?: string | undefined;
                                    value?: string | undefined;
                                }[] | undefined;
                            } & {
                                values?: ({
                                    key?: string | undefined;
                                    value?: string | undefined;
                                }[] & ({
                                    key?: string | undefined;
                                    value?: string | undefined;
                                } & {
                                    key?: string | undefined;
                                    value?: string | undefined;
                                } & { [K_6 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["request"]["headers"]["values"][number], keyof HeaderValue>]: never; })[] & { [K_7 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["request"]["headers"]["values"], keyof {
                                    key?: string | undefined;
                                    value?: string | undefined;
                                }[]>]: never; }) | undefined;
                            } & { [K_8 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["request"]["headers"], "values">]: never; }) | undefined;
                            query?: ({
                                [x: string]: any;
                            } & {
                                [x: string]: any;
                            } & { [K_9 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["request"]["query"], string | number>]: never; }) | undefined;
                            body?: ({
                                value?: ({
                                    stringValue?: string | undefined;
                                } & {
                                    $case: "stringValue";
                                }) | ({
                                    bytesValue?: Uint8Array | undefined;
                                } & {
                                    $case: "bytesValue";
                                }) | undefined;
                            } & {
                                value?: ({
                                    stringValue?: string | undefined;
                                } & {
                                    $case: "stringValue";
                                } & {
                                    stringValue?: string | undefined;
                                    $case: "stringValue";
                                } & { [K_10 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["request"]["body"]["value"], "stringValue" | "$case">]: never; }) | ({
                                    bytesValue?: Uint8Array | undefined;
                                } & {
                                    $case: "bytesValue";
                                } & {
                                    bytesValue?: Uint8Array | undefined;
                                    $case: "bytesValue";
                                } & { [K_11 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["request"]["body"]["value"], "$case" | "bytesValue">]: never; }) | undefined;
                            } & { [K_12 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["request"]["body"], "value">]: never; }) | undefined;
                        } & { [K_13 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"]["request"], keyof HttpRequest>]: never; }) | undefined;
                    } & { [K_14 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["response"], keyof HttpResponse>]: never; }) | undefined;
                    $case: "response";
                } & { [K_15 in Exclude<keyof I["value"]["httpRequestResult"]["value"], "$case" | "response">]: never; }) | ({
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
                        } & { [K_16 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["error"]["details"], string | number>]: never; }) | undefined;
                    } & { [K_17 in Exclude<keyof I["value"]["httpRequestResult"]["value"]["error"], keyof ErrorResult>]: never; }) | undefined;
                    $case: "error";
                } & { [K_18 in Exclude<keyof I["value"]["httpRequestResult"]["value"], "$case" | "error">]: never; }) | undefined;
            } & { [K_19 in Exclude<keyof I["value"]["httpRequestResult"], "value">]: never; }) | undefined;
            $case: "httpRequestResult";
        } & { [K_20 in Exclude<keyof I["value"], "$case" | "httpRequestResult">]: never; }) | ({
            webSocketResult?: {
                value?: ({
                    openEvent?: {} | undefined;
                } & {
                    $case: "openEvent";
                }) | ({
                    errorEvent?: {
                        reason?: string | undefined;
                    } | undefined;
                } & {
                    $case: "errorEvent";
                }) | ({
                    closeEvent?: {
                        code?: number | undefined;
                        reason?: string | undefined;
                    } | undefined;
                } & {
                    $case: "closeEvent";
                }) | ({
                    messageEvent?: {
                        value?: ({
                            stringValue?: string | undefined;
                        } & {
                            $case: "stringValue";
                        }) | ({
                            bytesValue?: Uint8Array | undefined;
                        } & {
                            $case: "bytesValue";
                        }) | undefined;
                    } | undefined;
                } & {
                    $case: "messageEvent";
                }) | ({
                    error?: {
                        code?: import("./errors").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } & {
                    $case: "error";
                }) | undefined;
            } | undefined;
        } & {
            $case: "webSocketResult";
        } & {
            webSocketResult?: ({
                value?: ({
                    openEvent?: {} | undefined;
                } & {
                    $case: "openEvent";
                }) | ({
                    errorEvent?: {
                        reason?: string | undefined;
                    } | undefined;
                } & {
                    $case: "errorEvent";
                }) | ({
                    closeEvent?: {
                        code?: number | undefined;
                        reason?: string | undefined;
                    } | undefined;
                } & {
                    $case: "closeEvent";
                }) | ({
                    messageEvent?: {
                        value?: ({
                            stringValue?: string | undefined;
                        } & {
                            $case: "stringValue";
                        }) | ({
                            bytesValue?: Uint8Array | undefined;
                        } & {
                            $case: "bytesValue";
                        }) | undefined;
                    } | undefined;
                } & {
                    $case: "messageEvent";
                }) | ({
                    error?: {
                        code?: import("./errors").Code | undefined;
                        message?: string | undefined;
                        details?: {
                            [x: string]: any;
                        } | undefined;
                    } | undefined;
                } & {
                    $case: "error";
                }) | undefined;
            } & {
                value?: ({
                    openEvent?: {} | undefined;
                } & {
                    $case: "openEvent";
                } & {
                    openEvent?: ({} & {} & { [K_21 in Exclude<keyof I["value"]["webSocketResult"]["value"]["openEvent"], never>]: never; }) | undefined;
                    $case: "openEvent";
                } & { [K_22 in Exclude<keyof I["value"]["webSocketResult"]["value"], "$case" | "openEvent">]: never; }) | ({
                    errorEvent?: {
                        reason?: string | undefined;
                    } | undefined;
                } & {
                    $case: "errorEvent";
                } & {
                    errorEvent?: ({
                        reason?: string | undefined;
                    } & {
                        reason?: string | undefined;
                    } & { [K_23 in Exclude<keyof I["value"]["webSocketResult"]["value"]["errorEvent"], "reason">]: never; }) | undefined;
                    $case: "errorEvent";
                } & { [K_24 in Exclude<keyof I["value"]["webSocketResult"]["value"], "$case" | "errorEvent">]: never; }) | ({
                    closeEvent?: {
                        code?: number | undefined;
                        reason?: string | undefined;
                    } | undefined;
                } & {
                    $case: "closeEvent";
                } & {
                    closeEvent?: ({
                        code?: number | undefined;
                        reason?: string | undefined;
                    } & {
                        code?: number | undefined;
                        reason?: string | undefined;
                    } & { [K_25 in Exclude<keyof I["value"]["webSocketResult"]["value"]["closeEvent"], keyof WebSocketCloseEvent>]: never; }) | undefined;
                    $case: "closeEvent";
                } & { [K_26 in Exclude<keyof I["value"]["webSocketResult"]["value"], "$case" | "closeEvent">]: never; }) | ({
                    messageEvent?: {
                        value?: ({
                            stringValue?: string | undefined;
                        } & {
                            $case: "stringValue";
                        }) | ({
                            bytesValue?: Uint8Array | undefined;
                        } & {
                            $case: "bytesValue";
                        }) | undefined;
                    } | undefined;
                } & {
                    $case: "messageEvent";
                } & {
                    messageEvent?: ({
                        value?: ({
                            stringValue?: string | undefined;
                        } & {
                            $case: "stringValue";
                        }) | ({
                            bytesValue?: Uint8Array | undefined;
                        } & {
                            $case: "bytesValue";
                        }) | undefined;
                    } & {
                        value?: ({
                            stringValue?: string | undefined;
                        } & {
                            $case: "stringValue";
                        } & {
                            stringValue?: string | undefined;
                            $case: "stringValue";
                        } & { [K_27 in Exclude<keyof I["value"]["webSocketResult"]["value"]["messageEvent"]["value"], "stringValue" | "$case">]: never; }) | ({
                            bytesValue?: Uint8Array | undefined;
                        } & {
                            $case: "bytesValue";
                        } & {
                            bytesValue?: Uint8Array | undefined;
                            $case: "bytesValue";
                        } & { [K_28 in Exclude<keyof I["value"]["webSocketResult"]["value"]["messageEvent"]["value"], "$case" | "bytesValue">]: never; }) | undefined;
                    } & { [K_29 in Exclude<keyof I["value"]["webSocketResult"]["value"]["messageEvent"], "value">]: never; }) | undefined;
                    $case: "messageEvent";
                } & { [K_30 in Exclude<keyof I["value"]["webSocketResult"]["value"], "$case" | "messageEvent">]: never; }) | ({
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
                        } & { [K_31 in Exclude<keyof I["value"]["webSocketResult"]["value"]["error"]["details"], string | number>]: never; }) | undefined;
                    } & { [K_32 in Exclude<keyof I["value"]["webSocketResult"]["value"]["error"], keyof ErrorResult>]: never; }) | undefined;
                    $case: "error";
                } & { [K_33 in Exclude<keyof I["value"]["webSocketResult"]["value"], "$case" | "error">]: never; }) | undefined;
            } & { [K_34 in Exclude<keyof I["value"]["webSocketResult"], "value">]: never; }) | undefined;
            $case: "webSocketResult";
        } & { [K_35 in Exclude<keyof I["value"], "$case" | "webSocketResult">]: never; }) | undefined;
    } & { [K_36 in Exclude<keyof I, keyof HttpRequestWebSocketResult>]: never; }>(object: I): HttpRequestWebSocketResult;
};
