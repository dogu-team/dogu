"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenCaptureOption = void 0;
/* eslint-disable */
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
function createBaseScreenCaptureOption() {
    return {
        bitRate: undefined,
        maxFps: undefined,
        frameRate: undefined,
        frameInterval: undefined,
        repeatFrameDelay: undefined,
        maxResolution: undefined,
        screenId: undefined,
        pid: undefined,
    };
}
exports.ScreenCaptureOption = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.bitRate !== undefined) {
            writer.uint32(9).fixed64(message.bitRate);
        }
        if (message.maxFps !== undefined) {
            writer.uint32(17).fixed64(message.maxFps);
        }
        if (message.frameRate !== undefined) {
            writer.uint32(25).fixed64(message.frameRate);
        }
        if (message.frameInterval !== undefined) {
            writer.uint32(33).fixed64(message.frameInterval);
        }
        if (message.repeatFrameDelay !== undefined) {
            writer.uint32(41).fixed64(message.repeatFrameDelay);
        }
        if (message.maxResolution !== undefined) {
            writer.uint32(53).fixed32(message.maxResolution);
        }
        if (message.screenId !== undefined) {
            writer.uint32(56).int32(message.screenId);
        }
        if (message.pid !== undefined) {
            writer.uint32(64).int32(message.pid);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseScreenCaptureOption();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.bitRate = longToNumber(reader.fixed64());
                    break;
                case 2:
                    message.maxFps = longToNumber(reader.fixed64());
                    break;
                case 3:
                    message.frameRate = longToNumber(reader.fixed64());
                    break;
                case 4:
                    message.frameInterval = longToNumber(reader.fixed64());
                    break;
                case 5:
                    message.repeatFrameDelay = longToNumber(reader.fixed64());
                    break;
                case 6:
                    message.maxResolution = reader.fixed32();
                    break;
                case 7:
                    message.screenId = reader.int32();
                    break;
                case 8:
                    message.pid = reader.int32();
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
            bitRate: isSet(object.bitRate) ? Number(object.bitRate) : undefined,
            maxFps: isSet(object.maxFps) ? Number(object.maxFps) : undefined,
            frameRate: isSet(object.frameRate) ? Number(object.frameRate) : undefined,
            frameInterval: isSet(object.frameInterval) ? Number(object.frameInterval) : undefined,
            repeatFrameDelay: isSet(object.repeatFrameDelay) ? Number(object.repeatFrameDelay) : undefined,
            maxResolution: isSet(object.maxResolution) ? Number(object.maxResolution) : undefined,
            screenId: isSet(object.screenId) ? Number(object.screenId) : undefined,
            pid: isSet(object.pid) ? Number(object.pid) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.bitRate !== undefined && (obj.bitRate = Math.round(message.bitRate));
        message.maxFps !== undefined && (obj.maxFps = Math.round(message.maxFps));
        message.frameRate !== undefined && (obj.frameRate = Math.round(message.frameRate));
        message.frameInterval !== undefined && (obj.frameInterval = Math.round(message.frameInterval));
        message.repeatFrameDelay !== undefined && (obj.repeatFrameDelay = Math.round(message.repeatFrameDelay));
        message.maxResolution !== undefined && (obj.maxResolution = Math.round(message.maxResolution));
        message.screenId !== undefined && (obj.screenId = Math.round(message.screenId));
        message.pid !== undefined && (obj.pid = Math.round(message.pid));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseScreenCaptureOption();
        message.bitRate = object.bitRate ?? undefined;
        message.maxFps = object.maxFps ?? undefined;
        message.frameRate = object.frameRate ?? undefined;
        message.frameInterval = object.frameInterval ?? undefined;
        message.repeatFrameDelay = object.repeatFrameDelay ?? undefined;
        message.maxResolution = object.maxResolution ?? undefined;
        message.screenId = object.screenId ?? undefined;
        message.pid = object.pid ?? undefined;
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
function longToNumber(long) {
    if (long.gt(Number.MAX_SAFE_INTEGER)) {
        throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER');
    }
    return long.toNumber();
}
if (minimal_1.default.util.Long !== long_1.default) {
    minimal_1.default.util.Long = long_1.default;
    minimal_1.default.configure();
}
function isSet(value) {
    return value !== null && value !== undefined;
}
