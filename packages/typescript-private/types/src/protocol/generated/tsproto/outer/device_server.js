"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceServerResponse = exports.DeviceHostUploadFileReceiveMessage = exports.DeviceHostUploadFileCompleteReceiveValue = exports.DeviceHostUploadFileInProgressReceiveValue = exports.DeviceHostUploadFileSendMessage = exports.DeviceHostUploadFileCompleteSendValue = exports.DeviceHostUploadFileInProgressSendValue = exports.DeviceHostUploadFileStartSendValue = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const struct_1 = require("../google/protobuf/struct");
const errors_1 = require("./errors");
function createBaseDeviceHostUploadFileStartSendValue() {
    return { fileName: '', fileSize: 0 };
}
exports.DeviceHostUploadFileStartSendValue = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.fileName !== '') {
            writer.uint32(10).string(message.fileName);
        }
        if (message.fileSize !== 0) {
            writer.uint32(21).fixed32(message.fileSize);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDeviceHostUploadFileStartSendValue();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fileName = reader.string();
                    break;
                case 2:
                    message.fileSize = reader.fixed32();
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
            fileName: isSet(object.fileName) ? String(object.fileName) : '',
            fileSize: isSet(object.fileSize) ? Number(object.fileSize) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.fileName !== undefined && (obj.fileName = message.fileName);
        message.fileSize !== undefined && (obj.fileSize = Math.round(message.fileSize));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDeviceHostUploadFileStartSendValue();
        message.fileName = object.fileName ?? '';
        message.fileSize = object.fileSize ?? 0;
        return message;
    },
};
function createBaseDeviceHostUploadFileInProgressSendValue() {
    return { chunk: new Uint8Array() };
}
exports.DeviceHostUploadFileInProgressSendValue = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.chunk.length !== 0) {
            writer.uint32(10).bytes(message.chunk);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDeviceHostUploadFileInProgressSendValue();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.chunk = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { chunk: isSet(object.chunk) ? bytesFromBase64(object.chunk) : new Uint8Array() };
    },
    toJSON(message) {
        const obj = {};
        message.chunk !== undefined && (obj.chunk = base64FromBytes(message.chunk !== undefined ? message.chunk : new Uint8Array()));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDeviceHostUploadFileInProgressSendValue();
        message.chunk = object.chunk ?? new Uint8Array();
        return message;
    },
};
function createBaseDeviceHostUploadFileCompleteSendValue() {
    return {};
}
exports.DeviceHostUploadFileCompleteSendValue = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDeviceHostUploadFileCompleteSendValue();
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
        const message = createBaseDeviceHostUploadFileCompleteSendValue();
        return message;
    },
};
function createBaseDeviceHostUploadFileSendMessage() {
    return { value: undefined };
}
exports.DeviceHostUploadFileSendMessage = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'start') {
            exports.DeviceHostUploadFileStartSendValue.encode(message.value.start, writer.uint32(10).fork()).ldelim();
        }
        if (message.value?.$case === 'inProgress') {
            exports.DeviceHostUploadFileInProgressSendValue.encode(message.value.inProgress, writer.uint32(18).fork()).ldelim();
        }
        if (message.value?.$case === 'complete') {
            exports.DeviceHostUploadFileCompleteSendValue.encode(message.value.complete, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDeviceHostUploadFileSendMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.value = { $case: 'start', start: exports.DeviceHostUploadFileStartSendValue.decode(reader, reader.uint32()) };
                    break;
                case 2:
                    message.value = {
                        $case: 'inProgress',
                        inProgress: exports.DeviceHostUploadFileInProgressSendValue.decode(reader, reader.uint32()),
                    };
                    break;
                case 3:
                    message.value = {
                        $case: 'complete',
                        complete: exports.DeviceHostUploadFileCompleteSendValue.decode(reader, reader.uint32()),
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
            value: isSet(object.start)
                ? { $case: 'start', start: exports.DeviceHostUploadFileStartSendValue.fromJSON(object.start) }
                : isSet(object.inProgress)
                    ? { $case: 'inProgress', inProgress: exports.DeviceHostUploadFileInProgressSendValue.fromJSON(object.inProgress) }
                    : isSet(object.complete)
                        ? { $case: 'complete', complete: exports.DeviceHostUploadFileCompleteSendValue.fromJSON(object.complete) }
                        : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'start' && (obj.start = message.value?.start ? exports.DeviceHostUploadFileStartSendValue.toJSON(message.value?.start) : undefined);
        message.value?.$case === 'inProgress' && (obj.inProgress = message.value?.inProgress ? exports.DeviceHostUploadFileInProgressSendValue.toJSON(message.value?.inProgress) : undefined);
        message.value?.$case === 'complete' && (obj.complete = message.value?.complete ? exports.DeviceHostUploadFileCompleteSendValue.toJSON(message.value?.complete) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDeviceHostUploadFileSendMessage();
        if (object.value?.$case === 'start' && object.value?.start !== undefined && object.value?.start !== null) {
            message.value = { $case: 'start', start: exports.DeviceHostUploadFileStartSendValue.fromPartial(object.value.start) };
        }
        if (object.value?.$case === 'inProgress' && object.value?.inProgress !== undefined && object.value?.inProgress !== null) {
            message.value = {
                $case: 'inProgress',
                inProgress: exports.DeviceHostUploadFileInProgressSendValue.fromPartial(object.value.inProgress),
            };
        }
        if (object.value?.$case === 'complete' && object.value?.complete !== undefined && object.value?.complete !== null) {
            message.value = {
                $case: 'complete',
                complete: exports.DeviceHostUploadFileCompleteSendValue.fromPartial(object.value.complete),
            };
        }
        return message;
    },
};
function createBaseDeviceHostUploadFileInProgressReceiveValue() {
    return { offset: 0 };
}
exports.DeviceHostUploadFileInProgressReceiveValue = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.offset !== 0) {
            writer.uint32(13).fixed32(message.offset);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDeviceHostUploadFileInProgressReceiveValue();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.offset = reader.fixed32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { offset: isSet(object.offset) ? Number(object.offset) : 0 };
    },
    toJSON(message) {
        const obj = {};
        message.offset !== undefined && (obj.offset = Math.round(message.offset));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDeviceHostUploadFileInProgressReceiveValue();
        message.offset = object.offset ?? 0;
        return message;
    },
};
function createBaseDeviceHostUploadFileCompleteReceiveValue() {
    return { filePath: '' };
}
exports.DeviceHostUploadFileCompleteReceiveValue = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.filePath !== '') {
            writer.uint32(10).string(message.filePath);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDeviceHostUploadFileCompleteReceiveValue();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.filePath = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { filePath: isSet(object.filePath) ? String(object.filePath) : '' };
    },
    toJSON(message) {
        const obj = {};
        message.filePath !== undefined && (obj.filePath = message.filePath);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDeviceHostUploadFileCompleteReceiveValue();
        message.filePath = object.filePath ?? '';
        return message;
    },
};
function createBaseDeviceHostUploadFileReceiveMessage() {
    return { value: undefined };
}
exports.DeviceHostUploadFileReceiveMessage = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'inProgress') {
            exports.DeviceHostUploadFileInProgressReceiveValue.encode(message.value.inProgress, writer.uint32(10).fork()).ldelim();
        }
        if (message.value?.$case === 'complete') {
            exports.DeviceHostUploadFileCompleteReceiveValue.encode(message.value.complete, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDeviceHostUploadFileReceiveMessage();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.value = {
                        $case: 'inProgress',
                        inProgress: exports.DeviceHostUploadFileInProgressReceiveValue.decode(reader, reader.uint32()),
                    };
                    break;
                case 2:
                    message.value = {
                        $case: 'complete',
                        complete: exports.DeviceHostUploadFileCompleteReceiveValue.decode(reader, reader.uint32()),
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
            value: isSet(object.inProgress)
                ? { $case: 'inProgress', inProgress: exports.DeviceHostUploadFileInProgressReceiveValue.fromJSON(object.inProgress) }
                : isSet(object.complete)
                    ? { $case: 'complete', complete: exports.DeviceHostUploadFileCompleteReceiveValue.fromJSON(object.complete) }
                    : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'inProgress' &&
            (obj.inProgress = message.value?.inProgress ? exports.DeviceHostUploadFileInProgressReceiveValue.toJSON(message.value?.inProgress) : undefined);
        message.value?.$case === 'complete' && (obj.complete = message.value?.complete ? exports.DeviceHostUploadFileCompleteReceiveValue.toJSON(message.value?.complete) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDeviceHostUploadFileReceiveMessage();
        if (object.value?.$case === 'inProgress' && object.value?.inProgress !== undefined && object.value?.inProgress !== null) {
            message.value = {
                $case: 'inProgress',
                inProgress: exports.DeviceHostUploadFileInProgressReceiveValue.fromPartial(object.value.inProgress),
            };
        }
        if (object.value?.$case === 'complete' && object.value?.complete !== undefined && object.value?.complete !== null) {
            message.value = {
                $case: 'complete',
                complete: exports.DeviceHostUploadFileCompleteReceiveValue.fromPartial(object.value.complete),
            };
        }
        return message;
    },
};
function createBaseDeviceServerResponse() {
    return { value: undefined };
}
exports.DeviceServerResponse = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'error') {
            errors_1.ErrorResult.encode(message.value.error, writer.uint32(10).fork()).ldelim();
        }
        if (message.value?.$case === 'data') {
            struct_1.Struct.encode(struct_1.Struct.wrap(message.value.data), writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDeviceServerResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.value = { $case: 'error', error: errors_1.ErrorResult.decode(reader, reader.uint32()) };
                    break;
                case 2:
                    message.value = { $case: 'data', data: struct_1.Struct.unwrap(struct_1.Struct.decode(reader, reader.uint32())) };
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
            value: isSet(object.error) ? { $case: 'error', error: errors_1.ErrorResult.fromJSON(object.error) } : isSet(object.data) ? { $case: 'data', data: object.data } : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'error' && (obj.error = message.value?.error ? errors_1.ErrorResult.toJSON(message.value?.error) : undefined);
        message.value?.$case === 'data' && (obj.data = message.value?.data);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDeviceServerResponse();
        if (object.value?.$case === 'error' && object.value?.error !== undefined && object.value?.error !== null) {
            message.value = { $case: 'error', error: errors_1.ErrorResult.fromPartial(object.value.error) };
        }
        if (object.value?.$case === 'data' && object.value?.data !== undefined && object.value?.data !== null) {
            message.value = { $case: 'data', data: object.value.data };
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
function isSet(value) {
    return value !== null && value !== undefined;
}
