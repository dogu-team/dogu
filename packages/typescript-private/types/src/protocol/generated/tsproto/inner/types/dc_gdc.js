"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcGdcRefreshSessionResult = exports.DcGdcRefreshSessionParam = exports.DcGdcGetSurfaceStatusResult = exports.DcGdcGetSurfaceStatusParam = exports.DcGdcStopScreenRecordResult = exports.DcGdcStopScreenRecordParam = exports.DcGdcStartScreenRecordResult = exports.DcGdcStartScreenRecordParam = exports.DcGdcStopStreamingResult = exports.DcGdcStopStreamingParam = exports.DcGdcStartStreamingResult = exports.DcGdcStartStreamingParam = exports.DcGdcUpdateDeviceListResult = exports.DcGdcUpdateDeviceListParam = exports.DcGdcDeviceContext = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const errors_1 = require("../../outer/errors");
const platform_1 = require("../../outer/platform");
const screenrecord_option_1 = require("../../outer/streaming/screenrecord_option");
const streaming_1 = require("../../outer/streaming/streaming");
function createBaseDcGdcDeviceContext() {
    return { serial: '', platform: 0, screenUrl: '', inputUrl: '', screenWidth: 0, screenHeight: 0 };
}
exports.DcGdcDeviceContext = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.serial !== '') {
            writer.uint32(10).string(message.serial);
        }
        if (message.platform !== 0) {
            writer.uint32(16).int32(message.platform);
        }
        if (message.screenUrl !== '') {
            writer.uint32(26).string(message.screenUrl);
        }
        if (message.inputUrl !== '') {
            writer.uint32(34).string(message.inputUrl);
        }
        if (message.screenWidth !== 0) {
            writer.uint32(240).uint32(message.screenWidth);
        }
        if (message.screenHeight !== 0) {
            writer.uint32(248).uint32(message.screenHeight);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcDeviceContext();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.serial = reader.string();
                    break;
                case 2:
                    message.platform = reader.int32();
                    break;
                case 3:
                    message.screenUrl = reader.string();
                    break;
                case 4:
                    message.inputUrl = reader.string();
                    break;
                case 30:
                    message.screenWidth = reader.uint32();
                    break;
                case 31:
                    message.screenHeight = reader.uint32();
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
            serial: isSet(object.serial) ? String(object.serial) : '',
            platform: isSet(object.platform) ? (0, platform_1.platformFromJSON)(object.platform) : 0,
            screenUrl: isSet(object.screenUrl) ? String(object.screenUrl) : '',
            inputUrl: isSet(object.inputUrl) ? String(object.inputUrl) : '',
            screenWidth: isSet(object.screenWidth) ? Number(object.screenWidth) : 0,
            screenHeight: isSet(object.screenHeight) ? Number(object.screenHeight) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.serial !== undefined && (obj.serial = message.serial);
        message.platform !== undefined && (obj.platform = (0, platform_1.platformToJSON)(message.platform));
        message.screenUrl !== undefined && (obj.screenUrl = message.screenUrl);
        message.inputUrl !== undefined && (obj.inputUrl = message.inputUrl);
        message.screenWidth !== undefined && (obj.screenWidth = Math.round(message.screenWidth));
        message.screenHeight !== undefined && (obj.screenHeight = Math.round(message.screenHeight));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcDeviceContext();
        message.serial = object.serial ?? '';
        message.platform = object.platform ?? 0;
        message.screenUrl = object.screenUrl ?? '';
        message.inputUrl = object.inputUrl ?? '';
        message.screenWidth = object.screenWidth ?? 0;
        message.screenHeight = object.screenHeight ?? 0;
        return message;
    },
};
function createBaseDcGdcUpdateDeviceListParam() {
    return { devices: [] };
}
exports.DcGdcUpdateDeviceListParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.devices) {
            exports.DcGdcDeviceContext.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcUpdateDeviceListParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.devices.push(exports.DcGdcDeviceContext.decode(reader, reader.uint32()));
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
            devices: Array.isArray(object?.devices) ? object.devices.map((e) => exports.DcGdcDeviceContext.fromJSON(e)) : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.devices) {
            obj.devices = message.devices.map((e) => (e ? exports.DcGdcDeviceContext.toJSON(e) : undefined));
        }
        else {
            obj.devices = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcUpdateDeviceListParam();
        message.devices = object.devices?.map((e) => exports.DcGdcDeviceContext.fromPartial(e)) || [];
        return message;
    },
};
function createBaseDcGdcUpdateDeviceListResult() {
    return {};
}
exports.DcGdcUpdateDeviceListResult = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcUpdateDeviceListResult();
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
        const message = createBaseDcGdcUpdateDeviceListResult();
        return message;
    },
};
function createBaseDcGdcStartStreamingParam() {
    return { offer: undefined };
}
exports.DcGdcStartStreamingParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.offer !== undefined) {
            streaming_1.StreamingOffer.encode(message.offer, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcStartStreamingParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.offer = streaming_1.StreamingOffer.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { offer: isSet(object.offer) ? streaming_1.StreamingOffer.fromJSON(object.offer) : undefined };
    },
    toJSON(message) {
        const obj = {};
        message.offer !== undefined && (obj.offer = message.offer ? streaming_1.StreamingOffer.toJSON(message.offer) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcStartStreamingParam();
        message.offer = object.offer !== undefined && object.offer !== null ? streaming_1.StreamingOffer.fromPartial(object.offer) : undefined;
        return message;
    },
};
function createBaseDcGdcStartStreamingResult() {
    return { answer: undefined };
}
exports.DcGdcStartStreamingResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.answer !== undefined) {
            streaming_1.StreamingAnswer.encode(message.answer, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcStartStreamingResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.answer = streaming_1.StreamingAnswer.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { answer: isSet(object.answer) ? streaming_1.StreamingAnswer.fromJSON(object.answer) : undefined };
    },
    toJSON(message) {
        const obj = {};
        message.answer !== undefined && (obj.answer = message.answer ? streaming_1.StreamingAnswer.toJSON(message.answer) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcStartStreamingResult();
        message.answer = object.answer !== undefined && object.answer !== null ? streaming_1.StreamingAnswer.fromPartial(object.answer) : undefined;
        return message;
    },
};
function createBaseDcGdcStopStreamingParam() {
    return { serial: '' };
}
exports.DcGdcStopStreamingParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.serial !== '') {
            writer.uint32(10).string(message.serial);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcStopStreamingParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.serial = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { serial: isSet(object.serial) ? String(object.serial) : '' };
    },
    toJSON(message) {
        const obj = {};
        message.serial !== undefined && (obj.serial = message.serial);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcStopStreamingParam();
        message.serial = object.serial ?? '';
        return message;
    },
};
function createBaseDcGdcStopStreamingResult() {
    return {};
}
exports.DcGdcStopStreamingResult = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcStopStreamingResult();
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
        const message = createBaseDcGdcStopStreamingResult();
        return message;
    },
};
function createBaseDcGdcStartScreenRecordParam() {
    return { serial: '', option: undefined };
}
exports.DcGdcStartScreenRecordParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.serial !== '') {
            writer.uint32(10).string(message.serial);
        }
        if (message.option !== undefined) {
            screenrecord_option_1.ScreenRecordOption.encode(message.option, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcStartScreenRecordParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.serial = reader.string();
                    break;
                case 2:
                    message.option = screenrecord_option_1.ScreenRecordOption.decode(reader, reader.uint32());
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
            serial: isSet(object.serial) ? String(object.serial) : '',
            option: isSet(object.option) ? screenrecord_option_1.ScreenRecordOption.fromJSON(object.option) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.serial !== undefined && (obj.serial = message.serial);
        message.option !== undefined && (obj.option = message.option ? screenrecord_option_1.ScreenRecordOption.toJSON(message.option) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcStartScreenRecordParam();
        message.serial = object.serial ?? '';
        message.option = object.option !== undefined && object.option !== null ? screenrecord_option_1.ScreenRecordOption.fromPartial(object.option) : undefined;
        return message;
    },
};
function createBaseDcGdcStartScreenRecordResult() {
    return { error: undefined };
}
exports.DcGdcStartScreenRecordResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.error !== undefined) {
            errors_1.ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcStartScreenRecordResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.error = errors_1.ErrorResult.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { error: isSet(object.error) ? errors_1.ErrorResult.fromJSON(object.error) : undefined };
    },
    toJSON(message) {
        const obj = {};
        message.error !== undefined && (obj.error = message.error ? errors_1.ErrorResult.toJSON(message.error) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcStartScreenRecordResult();
        message.error = object.error !== undefined && object.error !== null ? errors_1.ErrorResult.fromPartial(object.error) : undefined;
        return message;
    },
};
function createBaseDcGdcStopScreenRecordParam() {
    return { serial: '', filePath: '' };
}
exports.DcGdcStopScreenRecordParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.serial !== '') {
            writer.uint32(10).string(message.serial);
        }
        if (message.filePath !== '') {
            writer.uint32(18).string(message.filePath);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcStopScreenRecordParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.serial = reader.string();
                    break;
                case 2:
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
        return {
            serial: isSet(object.serial) ? String(object.serial) : '',
            filePath: isSet(object.filePath) ? String(object.filePath) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.serial !== undefined && (obj.serial = message.serial);
        message.filePath !== undefined && (obj.filePath = message.filePath);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcStopScreenRecordParam();
        message.serial = object.serial ?? '';
        message.filePath = object.filePath ?? '';
        return message;
    },
};
function createBaseDcGdcStopScreenRecordResult() {
    return { error: undefined, filePath: '' };
}
exports.DcGdcStopScreenRecordResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.error !== undefined) {
            errors_1.ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
        }
        if (message.filePath !== '') {
            writer.uint32(18).string(message.filePath);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcStopScreenRecordResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.error = errors_1.ErrorResult.decode(reader, reader.uint32());
                    break;
                case 2:
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
        return {
            error: isSet(object.error) ? errors_1.ErrorResult.fromJSON(object.error) : undefined,
            filePath: isSet(object.filePath) ? String(object.filePath) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.error !== undefined && (obj.error = message.error ? errors_1.ErrorResult.toJSON(message.error) : undefined);
        message.filePath !== undefined && (obj.filePath = message.filePath);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcStopScreenRecordResult();
        message.error = object.error !== undefined && object.error !== null ? errors_1.ErrorResult.fromPartial(object.error) : undefined;
        message.filePath = object.filePath ?? '';
        return message;
    },
};
function createBaseDcGdcGetSurfaceStatusParam() {
    return { serial: '', screenId: undefined, pid: undefined };
}
exports.DcGdcGetSurfaceStatusParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.serial !== '') {
            writer.uint32(10).string(message.serial);
        }
        if (message.screenId !== undefined) {
            writer.uint32(16).int32(message.screenId);
        }
        if (message.pid !== undefined) {
            writer.uint32(24).int32(message.pid);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcGetSurfaceStatusParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.serial = reader.string();
                    break;
                case 2:
                    message.screenId = reader.int32();
                    break;
                case 3:
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
            serial: isSet(object.serial) ? String(object.serial) : '',
            screenId: isSet(object.screenId) ? Number(object.screenId) : undefined,
            pid: isSet(object.pid) ? Number(object.pid) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.serial !== undefined && (obj.serial = message.serial);
        message.screenId !== undefined && (obj.screenId = Math.round(message.screenId));
        message.pid !== undefined && (obj.pid = Math.round(message.pid));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcGetSurfaceStatusParam();
        message.serial = object.serial ?? '';
        message.screenId = object.screenId ?? undefined;
        message.pid = object.pid ?? undefined;
        return message;
    },
};
function createBaseDcGdcGetSurfaceStatusResult() {
    return { hasSurface: false, isPlaying: false, lastFrameDeltaMillisec: 0 };
}
exports.DcGdcGetSurfaceStatusResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.hasSurface === true) {
            writer.uint32(8).bool(message.hasSurface);
        }
        if (message.isPlaying === true) {
            writer.uint32(16).bool(message.isPlaying);
        }
        if (message.lastFrameDeltaMillisec !== 0) {
            writer.uint32(24).uint32(message.lastFrameDeltaMillisec);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcGetSurfaceStatusResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.hasSurface = reader.bool();
                    break;
                case 2:
                    message.isPlaying = reader.bool();
                    break;
                case 3:
                    message.lastFrameDeltaMillisec = reader.uint32();
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
            hasSurface: isSet(object.hasSurface) ? Boolean(object.hasSurface) : false,
            isPlaying: isSet(object.isPlaying) ? Boolean(object.isPlaying) : false,
            lastFrameDeltaMillisec: isSet(object.lastFrameDeltaMillisec) ? Number(object.lastFrameDeltaMillisec) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.hasSurface !== undefined && (obj.hasSurface = message.hasSurface);
        message.isPlaying !== undefined && (obj.isPlaying = message.isPlaying);
        message.lastFrameDeltaMillisec !== undefined && (obj.lastFrameDeltaMillisec = Math.round(message.lastFrameDeltaMillisec));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcGetSurfaceStatusResult();
        message.hasSurface = object.hasSurface ?? false;
        message.isPlaying = object.isPlaying ?? false;
        message.lastFrameDeltaMillisec = object.lastFrameDeltaMillisec ?? 0;
        return message;
    },
};
function createBaseDcGdcRefreshSessionParam() {
    return { serial: '', reconnectScreen: undefined, reconnectInput: undefined };
}
exports.DcGdcRefreshSessionParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.serial !== '') {
            writer.uint32(10).string(message.serial);
        }
        if (message.reconnectScreen !== undefined) {
            writer.uint32(16).bool(message.reconnectScreen);
        }
        if (message.reconnectInput !== undefined) {
            writer.uint32(24).bool(message.reconnectInput);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcRefreshSessionParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.serial = reader.string();
                    break;
                case 2:
                    message.reconnectScreen = reader.bool();
                    break;
                case 3:
                    message.reconnectInput = reader.bool();
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
            serial: isSet(object.serial) ? String(object.serial) : '',
            reconnectScreen: isSet(object.reconnectScreen) ? Boolean(object.reconnectScreen) : undefined,
            reconnectInput: isSet(object.reconnectInput) ? Boolean(object.reconnectInput) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.serial !== undefined && (obj.serial = message.serial);
        message.reconnectScreen !== undefined && (obj.reconnectScreen = message.reconnectScreen);
        message.reconnectInput !== undefined && (obj.reconnectInput = message.reconnectInput);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcRefreshSessionParam();
        message.serial = object.serial ?? '';
        message.reconnectScreen = object.reconnectScreen ?? undefined;
        message.reconnectInput = object.reconnectInput ?? undefined;
        return message;
    },
};
function createBaseDcGdcRefreshSessionResult() {
    return { error: undefined };
}
exports.DcGdcRefreshSessionResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.error !== undefined) {
            errors_1.ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcRefreshSessionResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.error = errors_1.ErrorResult.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { error: isSet(object.error) ? errors_1.ErrorResult.fromJSON(object.error) : undefined };
    },
    toJSON(message) {
        const obj = {};
        message.error !== undefined && (obj.error = message.error ? errors_1.ErrorResult.toJSON(message.error) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcRefreshSessionResult();
        message.error = object.error !== undefined && object.error !== null ? errors_1.ErrorResult.fromPartial(object.error) : undefined;
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
