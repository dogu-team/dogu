"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequestWebSocketResult = exports.WebSocketResult = exports.WebSocketMessageEvent = exports.WebSocketCloseEvent = exports.WebSocketErrorEvent = exports.WebSocketOpenEvent = exports.WebSocketClose = exports.WebSocketMessage = exports.WebSocketConnection = exports.HttpRequestResult = exports.HttpRequestParam = exports.HttpResponse = exports.HttpRequest = exports.Body = exports.Headers = exports.HeaderValue = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const struct_1 = require("../google/protobuf/struct");
const errors_1 = require("./errors");
function createBaseHeaderValue() {
    return { key: '', value: '' };
}
exports.HeaderValue = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.key !== '') {
            writer.uint32(10).string(message.key);
        }
        if (message.value !== '') {
            writer.uint32(18).string(message.value);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHeaderValue();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.key = reader.string();
                    break;
                case 2:
                    message.value = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object.value) ? String(object.value) : '' };
    },
    toJSON(message) {
        const obj = {};
        message.key !== undefined && (obj.key = message.key);
        message.value !== undefined && (obj.value = message.value);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHeaderValue();
        message.key = object.key ?? '';
        message.value = object.value ?? '';
        return message;
    },
};
function createBaseHeaders() {
    return { values: [] };
}
exports.Headers = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.values) {
            exports.HeaderValue.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHeaders();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.values.push(exports.HeaderValue.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { values: Array.isArray(object?.values) ? object.values.map((e) => exports.HeaderValue.fromJSON(e)) : [] };
    },
    toJSON(message) {
        const obj = {};
        if (message.values) {
            obj.values = message.values.map((e) => (e ? exports.HeaderValue.toJSON(e) : undefined));
        }
        else {
            obj.values = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHeaders();
        message.values = object.values?.map((e) => exports.HeaderValue.fromPartial(e)) || [];
        return message;
    },
};
function createBaseBody() {
    return { value: undefined };
}
exports.Body = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'stringValue') {
            writer.uint32(10).string(message.value.stringValue);
        }
        if (message.value?.$case === 'bytesValue') {
            writer.uint32(18).bytes(message.value.bytesValue);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBody();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.value = { $case: 'stringValue', stringValue: reader.string() };
                    break;
                case 2:
                    message.value = { $case: 'bytesValue', bytesValue: reader.bytes() };
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            value: isSet(object.stringValue)
                ? { $case: 'stringValue', stringValue: String(object.stringValue) }
                : isSet(object.bytesValue)
                    ? { $case: 'bytesValue', bytesValue: bytesFromBase64(object.bytesValue) }
                    : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'stringValue' && (obj.stringValue = message.value?.stringValue);
        message.value?.$case === 'bytesValue' && (obj.bytesValue = message.value?.bytesValue !== undefined ? base64FromBytes(message.value?.bytesValue) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseBody();
        if (object.value?.$case === 'stringValue' && object.value?.stringValue !== undefined && object.value?.stringValue !== null) {
            message.value = { $case: 'stringValue', stringValue: object.value.stringValue };
        }
        if (object.value?.$case === 'bytesValue' && object.value?.bytesValue !== undefined && object.value?.bytesValue !== null) {
            message.value = { $case: 'bytesValue', bytesValue: object.value.bytesValue };
        }
        return message;
    },
};
function createBaseHttpRequest() {
    return { protocolDomain: undefined, method: '', path: '', headers: undefined, query: undefined, body: undefined };
}
exports.HttpRequest = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.protocolDomain !== undefined) {
            writer.uint32(10).string(message.protocolDomain);
        }
        if (message.method !== '') {
            writer.uint32(18).string(message.method);
        }
        if (message.path !== '') {
            writer.uint32(26).string(message.path);
        }
        if (message.headers !== undefined) {
            exports.Headers.encode(message.headers, writer.uint32(34).fork()).ldelim();
        }
        if (message.query !== undefined) {
            struct_1.Struct.encode(struct_1.Struct.wrap(message.query), writer.uint32(42).fork()).ldelim();
        }
        if (message.body !== undefined) {
            exports.Body.encode(message.body, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHttpRequest();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.protocolDomain = reader.string();
                    break;
                case 2:
                    message.method = reader.string();
                    break;
                case 3:
                    message.path = reader.string();
                    break;
                case 4:
                    message.headers = exports.Headers.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.query = struct_1.Struct.unwrap(struct_1.Struct.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.body = exports.Body.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            protocolDomain: isSet(object.protocolDomain) ? String(object.protocolDomain) : undefined,
            method: isSet(object.method) ? String(object.method) : '',
            path: isSet(object.path) ? String(object.path) : '',
            headers: isSet(object.headers) ? exports.Headers.fromJSON(object.headers) : undefined,
            query: isObject(object.query) ? object.query : undefined,
            body: isSet(object.body) ? exports.Body.fromJSON(object.body) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.protocolDomain !== undefined && (obj.protocolDomain = message.protocolDomain);
        message.method !== undefined && (obj.method = message.method);
        message.path !== undefined && (obj.path = message.path);
        message.headers !== undefined && (obj.headers = message.headers ? exports.Headers.toJSON(message.headers) : undefined);
        message.query !== undefined && (obj.query = message.query);
        message.body !== undefined && (obj.body = message.body ? exports.Body.toJSON(message.body) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHttpRequest();
        message.protocolDomain = object.protocolDomain ?? undefined;
        message.method = object.method ?? '';
        message.path = object.path ?? '';
        message.headers = object.headers !== undefined && object.headers !== null ? exports.Headers.fromPartial(object.headers) : undefined;
        message.query = object.query ?? undefined;
        message.body = object.body !== undefined && object.body !== null ? exports.Body.fromPartial(object.body) : undefined;
        return message;
    },
};
function createBaseHttpResponse() {
    return { statusCode: 0, headers: undefined, body: undefined };
}
exports.HttpResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.statusCode !== 0) {
            writer.uint32(13).sfixed32(message.statusCode);
        }
        if (message.headers !== undefined) {
            exports.Headers.encode(message.headers, writer.uint32(18).fork()).ldelim();
        }
        if (message.body !== undefined) {
            exports.Body.encode(message.body, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHttpResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.statusCode = reader.sfixed32();
                    break;
                case 2:
                    message.headers = exports.Headers.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.body = exports.Body.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            statusCode: isSet(object.statusCode) ? Number(object.statusCode) : 0,
            headers: isSet(object.headers) ? exports.Headers.fromJSON(object.headers) : undefined,
            body: isSet(object.body) ? exports.Body.fromJSON(object.body) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.statusCode !== undefined && (obj.statusCode = Math.round(message.statusCode));
        message.headers !== undefined && (obj.headers = message.headers ? exports.Headers.toJSON(message.headers) : undefined);
        message.body !== undefined && (obj.body = message.body ? exports.Body.toJSON(message.body) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHttpResponse();
        message.statusCode = object.statusCode ?? 0;
        message.headers = object.headers !== undefined && object.headers !== null ? exports.Headers.fromPartial(object.headers) : undefined;
        message.body = object.body !== undefined && object.body !== null ? exports.Body.fromPartial(object.body) : undefined;
        return message;
    },
};
function createBaseHttpRequestParam() {
    return { sequenceId: 0, request: undefined };
}
exports.HttpRequestParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.sequenceId !== 0) {
            writer.uint32(13).sfixed32(message.sequenceId);
        }
        if (message.request !== undefined) {
            exports.HttpRequest.encode(message.request, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHttpRequestParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sequenceId = reader.sfixed32();
                    break;
                case 2:
                    message.request = exports.HttpRequest.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            sequenceId: isSet(object.sequenceId) ? Number(object.sequenceId) : 0,
            request: isSet(object.request) ? exports.HttpRequest.fromJSON(object.request) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.sequenceId !== undefined && (obj.sequenceId = Math.round(message.sequenceId));
        message.request !== undefined && (obj.request = message.request ? exports.HttpRequest.toJSON(message.request) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHttpRequestParam();
        message.sequenceId = object.sequenceId ?? 0;
        message.request = object.request !== undefined && object.request !== null ? exports.HttpRequest.fromPartial(object.request) : undefined;
        return message;
    },
};
function createBaseHttpRequestResult() {
    return { value: undefined };
}
exports.HttpRequestResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'response') {
            exports.HttpResponse.encode(message.value.response, writer.uint32(18).fork()).ldelim();
        }
        if (message.value?.$case === 'error') {
            errors_1.ErrorResult.encode(message.value.error, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHttpRequestResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.value = { $case: 'response', response: exports.HttpResponse.decode(reader, reader.uint32()) };
                    break;
                case 3:
                    message.value = { $case: 'error', error: errors_1.ErrorResult.decode(reader, reader.uint32()) };
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            value: isSet(object.response)
                ? { $case: 'response', response: exports.HttpResponse.fromJSON(object.response) }
                : isSet(object.error)
                    ? { $case: 'error', error: errors_1.ErrorResult.fromJSON(object.error) }
                    : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'response' && (obj.response = message.value?.response ? exports.HttpResponse.toJSON(message.value?.response) : undefined);
        message.value?.$case === 'error' && (obj.error = message.value?.error ? errors_1.ErrorResult.toJSON(message.value?.error) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHttpRequestResult();
        if (object.value?.$case === 'response' && object.value?.response !== undefined && object.value?.response !== null) {
            message.value = { $case: 'response', response: exports.HttpResponse.fromPartial(object.value.response) };
        }
        if (object.value?.$case === 'error' && object.value?.error !== undefined && object.value?.error !== null) {
            message.value = { $case: 'error', error: errors_1.ErrorResult.fromPartial(object.value.error) };
        }
        return message;
    },
};
function createBaseWebSocketConnection() {
    return { protocolDomain: undefined, path: '', query: undefined, headers: undefined };
}
exports.WebSocketConnection = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.protocolDomain !== undefined) {
            writer.uint32(10).string(message.protocolDomain);
        }
        if (message.path !== '') {
            writer.uint32(18).string(message.path);
        }
        if (message.query !== undefined) {
            struct_1.Struct.encode(struct_1.Struct.wrap(message.query), writer.uint32(26).fork()).ldelim();
        }
        if (message.headers !== undefined) {
            exports.Headers.encode(message.headers, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseWebSocketConnection();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.protocolDomain = reader.string();
                    break;
                case 2:
                    message.path = reader.string();
                    break;
                case 3:
                    message.query = struct_1.Struct.unwrap(struct_1.Struct.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.headers = exports.Headers.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            protocolDomain: isSet(object.protocolDomain) ? String(object.protocolDomain) : undefined,
            path: isSet(object.path) ? String(object.path) : '',
            query: isObject(object.query) ? object.query : undefined,
            headers: isSet(object.headers) ? exports.Headers.fromJSON(object.headers) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.protocolDomain !== undefined && (obj.protocolDomain = message.protocolDomain);
        message.path !== undefined && (obj.path = message.path);
        message.query !== undefined && (obj.query = message.query);
        message.headers !== undefined && (obj.headers = message.headers ? exports.Headers.toJSON(message.headers) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseWebSocketConnection();
        message.protocolDomain = object.protocolDomain ?? undefined;
        message.path = object.path ?? '';
        message.query = object.query ?? undefined;
        message.headers = object.headers !== undefined && object.headers !== null ? exports.Headers.fromPartial(object.headers) : undefined;
        return message;
    },
};
function createBaseWebSocketMessage() {
    return { value: undefined };
}
exports.WebSocketMessage = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'stringValue') {
            writer.uint32(10).string(message.value.stringValue);
        }
        if (message.value?.$case === 'bytesValue') {
            writer.uint32(18).bytes(message.value.bytesValue);
        }
        if (message.value?.$case === 'connection') {
            exports.WebSocketConnection.encode(message.value.connection, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseWebSocketMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.value = { $case: 'stringValue', stringValue: reader.string() };
                    break;
                case 2:
                    message.value = { $case: 'bytesValue', bytesValue: reader.bytes() };
                    break;
                case 3:
                    message.value = { $case: 'connection', connection: exports.WebSocketConnection.decode(reader, reader.uint32()) };
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            value: isSet(object.stringValue)
                ? { $case: 'stringValue', stringValue: String(object.stringValue) }
                : isSet(object.bytesValue)
                    ? { $case: 'bytesValue', bytesValue: bytesFromBase64(object.bytesValue) }
                    : isSet(object.connection)
                        ? { $case: 'connection', connection: exports.WebSocketConnection.fromJSON(object.connection) }
                        : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'stringValue' && (obj.stringValue = message.value?.stringValue);
        message.value?.$case === 'bytesValue' && (obj.bytesValue = message.value?.bytesValue !== undefined ? base64FromBytes(message.value?.bytesValue) : undefined);
        message.value?.$case === 'connection' && (obj.connection = message.value?.connection ? exports.WebSocketConnection.toJSON(message.value?.connection) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseWebSocketMessage();
        if (object.value?.$case === 'stringValue' && object.value?.stringValue !== undefined && object.value?.stringValue !== null) {
            message.value = { $case: 'stringValue', stringValue: object.value.stringValue };
        }
        if (object.value?.$case === 'bytesValue' && object.value?.bytesValue !== undefined && object.value?.bytesValue !== null) {
            message.value = { $case: 'bytesValue', bytesValue: object.value.bytesValue };
        }
        if (object.value?.$case === 'connection' && object.value?.connection !== undefined && object.value?.connection !== null) {
            message.value = { $case: 'connection', connection: exports.WebSocketConnection.fromPartial(object.value.connection) };
        }
        return message;
    },
};
function createBaseWebSocketClose() {
    return { code: 0, reason: '' };
}
exports.WebSocketClose = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.code !== 0) {
            writer.uint32(13).sfixed32(message.code);
        }
        if (message.reason !== '') {
            writer.uint32(18).string(message.reason);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseWebSocketClose();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.code = reader.sfixed32();
                    break;
                case 2:
                    message.reason = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            code: isSet(object.code) ? Number(object.code) : 0,
            reason: isSet(object.reason) ? String(object.reason) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.code !== undefined && (obj.code = Math.round(message.code));
        message.reason !== undefined && (obj.reason = message.reason);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseWebSocketClose();
        message.code = object.code ?? 0;
        message.reason = object.reason ?? '';
        return message;
    },
};
function createBaseWebSocketOpenEvent() {
    return {};
}
exports.WebSocketOpenEvent = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseWebSocketOpenEvent();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(_) {
        return {};
    },
    toJSON(_) {
        const obj = {};
        return obj;
    },
    fromPartial(_) {
        const message = createBaseWebSocketOpenEvent();
        return message;
    },
};
function createBaseWebSocketErrorEvent() {
    return { reason: '' };
}
exports.WebSocketErrorEvent = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.reason !== '') {
            writer.uint32(10).string(message.reason);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseWebSocketErrorEvent();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.reason = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { reason: isSet(object.reason) ? String(object.reason) : '' };
    },
    toJSON(message) {
        const obj = {};
        message.reason !== undefined && (obj.reason = message.reason);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseWebSocketErrorEvent();
        message.reason = object.reason ?? '';
        return message;
    },
};
function createBaseWebSocketCloseEvent() {
    return { code: 0, reason: '' };
}
exports.WebSocketCloseEvent = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.code !== 0) {
            writer.uint32(13).sfixed32(message.code);
        }
        if (message.reason !== '') {
            writer.uint32(18).string(message.reason);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseWebSocketCloseEvent();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.code = reader.sfixed32();
                    break;
                case 2:
                    message.reason = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            code: isSet(object.code) ? Number(object.code) : 0,
            reason: isSet(object.reason) ? String(object.reason) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.code !== undefined && (obj.code = Math.round(message.code));
        message.reason !== undefined && (obj.reason = message.reason);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseWebSocketCloseEvent();
        message.code = object.code ?? 0;
        message.reason = object.reason ?? '';
        return message;
    },
};
function createBaseWebSocketMessageEvent() {
    return { value: undefined };
}
exports.WebSocketMessageEvent = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'stringValue') {
            writer.uint32(10).string(message.value.stringValue);
        }
        if (message.value?.$case === 'bytesValue') {
            writer.uint32(18).bytes(message.value.bytesValue);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseWebSocketMessageEvent();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.value = { $case: 'stringValue', stringValue: reader.string() };
                    break;
                case 2:
                    message.value = { $case: 'bytesValue', bytesValue: reader.bytes() };
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            value: isSet(object.stringValue)
                ? { $case: 'stringValue', stringValue: String(object.stringValue) }
                : isSet(object.bytesValue)
                    ? { $case: 'bytesValue', bytesValue: bytesFromBase64(object.bytesValue) }
                    : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'stringValue' && (obj.stringValue = message.value?.stringValue);
        message.value?.$case === 'bytesValue' && (obj.bytesValue = message.value?.bytesValue !== undefined ? base64FromBytes(message.value?.bytesValue) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseWebSocketMessageEvent();
        if (object.value?.$case === 'stringValue' && object.value?.stringValue !== undefined && object.value?.stringValue !== null) {
            message.value = { $case: 'stringValue', stringValue: object.value.stringValue };
        }
        if (object.value?.$case === 'bytesValue' && object.value?.bytesValue !== undefined && object.value?.bytesValue !== null) {
            message.value = { $case: 'bytesValue', bytesValue: object.value.bytesValue };
        }
        return message;
    },
};
function createBaseWebSocketResult() {
    return { value: undefined };
}
exports.WebSocketResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'openEvent') {
            exports.WebSocketOpenEvent.encode(message.value.openEvent, writer.uint32(10).fork()).ldelim();
        }
        if (message.value?.$case === 'errorEvent') {
            exports.WebSocketErrorEvent.encode(message.value.errorEvent, writer.uint32(18).fork()).ldelim();
        }
        if (message.value?.$case === 'closeEvent') {
            exports.WebSocketCloseEvent.encode(message.value.closeEvent, writer.uint32(26).fork()).ldelim();
        }
        if (message.value?.$case === 'messageEvent') {
            exports.WebSocketMessageEvent.encode(message.value.messageEvent, writer.uint32(34).fork()).ldelim();
        }
        if (message.value?.$case === 'error') {
            errors_1.ErrorResult.encode(message.value.error, writer.uint32(42).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseWebSocketResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.value = { $case: 'openEvent', openEvent: exports.WebSocketOpenEvent.decode(reader, reader.uint32()) };
                    break;
                case 2:
                    message.value = { $case: 'errorEvent', errorEvent: exports.WebSocketErrorEvent.decode(reader, reader.uint32()) };
                    break;
                case 3:
                    message.value = { $case: 'closeEvent', closeEvent: exports.WebSocketCloseEvent.decode(reader, reader.uint32()) };
                    break;
                case 4:
                    message.value = {
                        $case: 'messageEvent',
                        messageEvent: exports.WebSocketMessageEvent.decode(reader, reader.uint32()),
                    };
                    break;
                case 5:
                    message.value = { $case: 'error', error: errors_1.ErrorResult.decode(reader, reader.uint32()) };
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            value: isSet(object.openEvent)
                ? { $case: 'openEvent', openEvent: exports.WebSocketOpenEvent.fromJSON(object.openEvent) }
                : isSet(object.errorEvent)
                    ? { $case: 'errorEvent', errorEvent: exports.WebSocketErrorEvent.fromJSON(object.errorEvent) }
                    : isSet(object.closeEvent)
                        ? { $case: 'closeEvent', closeEvent: exports.WebSocketCloseEvent.fromJSON(object.closeEvent) }
                        : isSet(object.messageEvent)
                            ? { $case: 'messageEvent', messageEvent: exports.WebSocketMessageEvent.fromJSON(object.messageEvent) }
                            : isSet(object.error)
                                ? { $case: 'error', error: errors_1.ErrorResult.fromJSON(object.error) }
                                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'openEvent' && (obj.openEvent = message.value?.openEvent ? exports.WebSocketOpenEvent.toJSON(message.value?.openEvent) : undefined);
        message.value?.$case === 'errorEvent' && (obj.errorEvent = message.value?.errorEvent ? exports.WebSocketErrorEvent.toJSON(message.value?.errorEvent) : undefined);
        message.value?.$case === 'closeEvent' && (obj.closeEvent = message.value?.closeEvent ? exports.WebSocketCloseEvent.toJSON(message.value?.closeEvent) : undefined);
        message.value?.$case === 'messageEvent' && (obj.messageEvent = message.value?.messageEvent ? exports.WebSocketMessageEvent.toJSON(message.value?.messageEvent) : undefined);
        message.value?.$case === 'error' && (obj.error = message.value?.error ? errors_1.ErrorResult.toJSON(message.value?.error) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseWebSocketResult();
        if (object.value?.$case === 'openEvent' && object.value?.openEvent !== undefined && object.value?.openEvent !== null) {
            message.value = { $case: 'openEvent', openEvent: exports.WebSocketOpenEvent.fromPartial(object.value.openEvent) };
        }
        if (object.value?.$case === 'errorEvent' && object.value?.errorEvent !== undefined && object.value?.errorEvent !== null) {
            message.value = { $case: 'errorEvent', errorEvent: exports.WebSocketErrorEvent.fromPartial(object.value.errorEvent) };
        }
        if (object.value?.$case === 'closeEvent' && object.value?.closeEvent !== undefined && object.value?.closeEvent !== null) {
            message.value = { $case: 'closeEvent', closeEvent: exports.WebSocketCloseEvent.fromPartial(object.value.closeEvent) };
        }
        if (object.value?.$case === 'messageEvent' && object.value?.messageEvent !== undefined && object.value?.messageEvent !== null) {
            message.value = {
                $case: 'messageEvent',
                messageEvent: exports.WebSocketMessageEvent.fromPartial(object.value.messageEvent),
            };
        }
        if (object.value?.$case === 'error' && object.value?.error !== undefined && object.value?.error !== null) {
            message.value = { $case: 'error', error: errors_1.ErrorResult.fromPartial(object.value.error) };
        }
        return message;
    },
};
function createBaseHttpRequestWebSocketResult() {
    return { sequenceId: 0, value: undefined };
}
exports.HttpRequestWebSocketResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.sequenceId !== 0) {
            writer.uint32(13).sfixed32(message.sequenceId);
        }
        if (message.value?.$case === 'httpRequestResult') {
            exports.HttpRequestResult.encode(message.value.httpRequestResult, writer.uint32(18).fork()).ldelim();
        }
        if (message.value?.$case === 'webSocketResult') {
            exports.WebSocketResult.encode(message.value.webSocketResult, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseHttpRequestWebSocketResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sequenceId = reader.sfixed32();
                    break;
                case 2:
                    message.value = {
                        $case: 'httpRequestResult',
                        httpRequestResult: exports.HttpRequestResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 3:
                    message.value = {
                        $case: 'webSocketResult',
                        webSocketResult: exports.WebSocketResult.decode(reader, reader.uint32()),
                    };
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            sequenceId: isSet(object.sequenceId) ? Number(object.sequenceId) : 0,
            value: isSet(object.httpRequestResult)
                ? { $case: 'httpRequestResult', httpRequestResult: exports.HttpRequestResult.fromJSON(object.httpRequestResult) }
                : isSet(object.webSocketResult)
                    ? { $case: 'webSocketResult', webSocketResult: exports.WebSocketResult.fromJSON(object.webSocketResult) }
                    : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.sequenceId !== undefined && (obj.sequenceId = Math.round(message.sequenceId));
        message.value?.$case === 'httpRequestResult' &&
            (obj.httpRequestResult = message.value?.httpRequestResult ? exports.HttpRequestResult.toJSON(message.value?.httpRequestResult) : undefined);
        message.value?.$case === 'webSocketResult' && (obj.webSocketResult = message.value?.webSocketResult ? exports.WebSocketResult.toJSON(message.value?.webSocketResult) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseHttpRequestWebSocketResult();
        message.sequenceId = object.sequenceId ?? 0;
        if (object.value?.$case === 'httpRequestResult' && object.value?.httpRequestResult !== undefined && object.value?.httpRequestResult !== null) {
            message.value = {
                $case: 'httpRequestResult',
                httpRequestResult: exports.HttpRequestResult.fromPartial(object.value.httpRequestResult),
            };
        }
        if (object.value?.$case === 'webSocketResult' && object.value?.webSocketResult !== undefined && object.value?.webSocketResult !== null) {
            message.value = {
                $case: 'webSocketResult',
                webSocketResult: exports.WebSocketResult.fromPartial(object.value.webSocketResult),
            };
        }
        return message;
    },
};
var globalThis = (() => {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    throw 'Unable to locate global object';
})();
function bytesFromBase64(b64) {
    if (globalThis.Buffer) {
        return Uint8Array.from(globalThis.Buffer.from(b64, 'base64'));
    }
    else {
        const bin = globalThis.atob(b64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; ++i) {
            arr[i] = bin.charCodeAt(i);
        }
        return arr;
    }
}
function base64FromBytes(arr) {
    if (globalThis.Buffer) {
        return globalThis.Buffer.from(arr).toString('base64');
    }
    else {
        const bin = [];
        arr.forEach((byte) => {
            bin.push(String.fromCharCode(byte));
        });
        return globalThis.btoa(bin.join(''));
    }
}
function isObject(value) {
    return typeof value === 'object' && value !== null;
}
function isSet(value) {
    return value !== null && value !== undefined;
}
