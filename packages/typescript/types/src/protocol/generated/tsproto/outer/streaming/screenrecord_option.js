"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenRecordOption = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const screencapture_option_1 = require("./screencapture_option");
function createBaseScreenRecordOption() {
    return { screen: undefined, filePath: '', etcParam: undefined };
}
exports.ScreenRecordOption = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.screen !== undefined) {
            screencapture_option_1.ScreenCaptureOption.encode(message.screen, writer.uint32(10).fork()).ldelim();
        }
        if (message.filePath !== '') {
            writer.uint32(18).string(message.filePath);
        }
        if (message.etcParam !== undefined) {
            writer.uint32(82).string(message.etcParam);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseScreenRecordOption();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.screen = screencapture_option_1.ScreenCaptureOption.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.filePath = reader.string();
                    break;
                case 10:
                    message.etcParam = reader.string();
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
            screen: isSet(object.screen) ? screencapture_option_1.ScreenCaptureOption.fromJSON(object.screen) : undefined,
            filePath: isSet(object.filePath) ? String(object.filePath) : '',
            etcParam: isSet(object.etcParam) ? String(object.etcParam) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.screen !== undefined && (obj.screen = message.screen ? screencapture_option_1.ScreenCaptureOption.toJSON(message.screen) : undefined);
        message.filePath !== undefined && (obj.filePath = message.filePath);
        message.etcParam !== undefined && (obj.etcParam = message.etcParam);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseScreenRecordOption();
        message.screen = object.screen !== undefined && object.screen !== null ? screencapture_option_1.ScreenCaptureOption.fromPartial(object.screen) : undefined;
        message.filePath = object.filePath ?? '';
        message.etcParam = object.etcParam ?? undefined;
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
