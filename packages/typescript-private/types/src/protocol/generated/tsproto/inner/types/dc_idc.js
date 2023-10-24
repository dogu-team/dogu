"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcIdcStopScreenRecordResult = exports.DcIdcStopScreenRecordParam = exports.DcIdcStartScreenRecordResult = exports.DcIdcStartScreenRecordParam = exports.DcIdcCheckGrpcHealthResult = exports.DcIdcCheckGrpcHealthParam = exports.DcIdcOpenGrpcClientResult = exports.DcIdcOpenGrpcClientParam = exports.DcIdcScanIdsResult = exports.DcIdcScanIdsParam = exports.DcIdcStartStreamingResult = exports.DcIdcStartStreamingParam = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const errors_1 = require("../../outer/errors");
const screenrecord_option_1 = require("../../outer/streaming/screenrecord_option");
const streaming_1 = require("../../outer/streaming/streaming");
function createBaseDcIdcStartStreamingParam() {
    return { offer: undefined };
}
exports.DcIdcStartStreamingParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.offer !== undefined) {
            streaming_1.StreamingOffer.encode(message.offer, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdcStartStreamingParam();
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
        const message = createBaseDcIdcStartStreamingParam();
        message.offer = object.offer !== undefined && object.offer !== null ? streaming_1.StreamingOffer.fromPartial(object.offer) : undefined;
        return message;
    },
};
function createBaseDcIdcStartStreamingResult() {
    return { answer: undefined };
}
exports.DcIdcStartStreamingResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.answer !== undefined) {
            streaming_1.StreamingAnswer.encode(message.answer, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdcStartStreamingResult();
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
        const message = createBaseDcIdcStartStreamingResult();
        message.answer = object.answer !== undefined && object.answer !== null ? streaming_1.StreamingAnswer.fromPartial(object.answer) : undefined;
        return message;
    },
};
function createBaseDcIdcScanIdsParam() {
    return {};
}
exports.DcIdcScanIdsParam = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdcScanIdsParam();
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
        const message = createBaseDcIdcScanIdsParam();
        return message;
    },
};
function createBaseDcIdcScanIdsResult() {
    return { ids: [] };
}
exports.DcIdcScanIdsResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.ids) {
            writer.uint32(10).string(v);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdcScanIdsResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.ids.push(reader.string());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { ids: Array.isArray(object?.ids) ? object.ids.map((e) => String(e)) : [] };
    },
    toJSON(message) {
        const obj = {};
        if (message.ids) {
            obj.ids = message.ids.map((e) => e);
        }
        else {
            obj.ids = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdcScanIdsResult();
        message.ids = object.ids?.map((e) => e) || [];
        return message;
    },
};
function createBaseDcIdcOpenGrpcClientParam() {
    return { serial: '', grpcHost: '', grpcPort: 0 };
}
exports.DcIdcOpenGrpcClientParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.serial !== '') {
            writer.uint32(10).string(message.serial);
        }
        if (message.grpcHost !== '') {
            writer.uint32(18).string(message.grpcHost);
        }
        if (message.grpcPort !== 0) {
            writer.uint32(29).fixed32(message.grpcPort);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdcOpenGrpcClientParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.serial = reader.string();
                    break;
                case 2:
                    message.grpcHost = reader.string();
                    break;
                case 3:
                    message.grpcPort = reader.fixed32();
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
            grpcHost: isSet(object.grpcHost) ? String(object.grpcHost) : '',
            grpcPort: isSet(object.grpcPort) ? Number(object.grpcPort) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.serial !== undefined && (obj.serial = message.serial);
        message.grpcHost !== undefined && (obj.grpcHost = message.grpcHost);
        message.grpcPort !== undefined && (obj.grpcPort = Math.round(message.grpcPort));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdcOpenGrpcClientParam();
        message.serial = object.serial ?? '';
        message.grpcHost = object.grpcHost ?? '';
        message.grpcPort = object.grpcPort ?? 0;
        return message;
    },
};
function createBaseDcIdcOpenGrpcClientResult() {
    return {};
}
exports.DcIdcOpenGrpcClientResult = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdcOpenGrpcClientResult();
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
        const message = createBaseDcIdcOpenGrpcClientResult();
        return message;
    },
};
function createBaseDcIdcCheckGrpcHealthParam() {
    return { serial: '' };
}
exports.DcIdcCheckGrpcHealthParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.serial !== '') {
            writer.uint32(10).string(message.serial);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdcCheckGrpcHealthParam();
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
        const message = createBaseDcIdcCheckGrpcHealthParam();
        message.serial = object.serial ?? '';
        return message;
    },
};
function createBaseDcIdcCheckGrpcHealthResult() {
    return {};
}
exports.DcIdcCheckGrpcHealthResult = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdcCheckGrpcHealthResult();
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
        const message = createBaseDcIdcCheckGrpcHealthResult();
        return message;
    },
};
function createBaseDcIdcStartScreenRecordParam() {
    return { serial: '', option: undefined };
}
exports.DcIdcStartScreenRecordParam = {
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
        const message = createBaseDcIdcStartScreenRecordParam();
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
        const message = createBaseDcIdcStartScreenRecordParam();
        message.serial = object.serial ?? '';
        message.option = object.option !== undefined && object.option !== null ? screenrecord_option_1.ScreenRecordOption.fromPartial(object.option) : undefined;
        return message;
    },
};
function createBaseDcIdcStartScreenRecordResult() {
    return { error: undefined };
}
exports.DcIdcStartScreenRecordResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.error !== undefined) {
            errors_1.ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdcStartScreenRecordResult();
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
        const message = createBaseDcIdcStartScreenRecordResult();
        message.error = object.error !== undefined && object.error !== null ? errors_1.ErrorResult.fromPartial(object.error) : undefined;
        return message;
    },
};
function createBaseDcIdcStopScreenRecordParam() {
    return { serial: '' };
}
exports.DcIdcStopScreenRecordParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.serial !== '') {
            writer.uint32(10).string(message.serial);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdcStopScreenRecordParam();
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
        const message = createBaseDcIdcStopScreenRecordParam();
        message.serial = object.serial ?? '';
        return message;
    },
};
function createBaseDcIdcStopScreenRecordResult() {
    return { error: undefined, filePath: '' };
}
exports.DcIdcStopScreenRecordResult = {
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
        const message = createBaseDcIdcStopScreenRecordResult();
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
        const message = createBaseDcIdcStopScreenRecordResult();
        message.error = object.error !== undefined && object.error !== null ? errors_1.ErrorResult.fromPartial(object.error) : undefined;
        message.filePath = object.filePath ?? '';
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
