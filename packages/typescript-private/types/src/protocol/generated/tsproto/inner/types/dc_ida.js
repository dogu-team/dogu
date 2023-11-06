"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcIdaSubscribeAlertResult = exports.DcIdaSubscribeAlertParam = exports.DcIdaSwitchInputBlockResult = exports.DcIdaSwitchInputBlockParam = exports.DcIdaQueryProfileResult = exports.DcIdaQueryProfileParam = exports.DcIdaIsPortListeningResult = exports.DcIdaIsPortListeningParam = exports.DcIdaGetSystemInfoResult = exports.DcIdaGetSystemInfoParam = exports.DcIdaRunAppResult = exports.DcIdaRunAppParam = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const errors_1 = require("../../outer/errors");
const profile_method_1 = require("../../outer/profile/profile_method");
const runtime_info_1 = require("../../outer/profile/runtime_info");
function createBaseDcIdaRunAppParam() {
    return { appPath: '', installedAppNames: [], bundleId: '' };
}
exports.DcIdaRunAppParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.appPath !== '') {
            writer.uint32(10).string(message.appPath);
        }
        for (const v of message.installedAppNames) {
            writer.uint32(18).string(v);
        }
        if (message.bundleId !== '') {
            writer.uint32(26).string(message.bundleId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaRunAppParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.appPath = reader.string();
                    break;
                case 2:
                    message.installedAppNames.push(reader.string());
                    break;
                case 3:
                    message.bundleId = reader.string();
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
            appPath: isSet(object.appPath) ? String(object.appPath) : '',
            installedAppNames: Array.isArray(object?.installedAppNames) ? object.installedAppNames.map((e) => String(e)) : [],
            bundleId: isSet(object.bundleId) ? String(object.bundleId) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.appPath !== undefined && (obj.appPath = message.appPath);
        if (message.installedAppNames) {
            obj.installedAppNames = message.installedAppNames.map((e) => e);
        }
        else {
            obj.installedAppNames = [];
        }
        message.bundleId !== undefined && (obj.bundleId = message.bundleId);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdaRunAppParam();
        message.appPath = object.appPath ?? '';
        message.installedAppNames = object.installedAppNames?.map((e) => e) || [];
        message.bundleId = object.bundleId ?? '';
        return message;
    },
};
function createBaseDcIdaRunAppResult() {
    return { error: undefined };
}
exports.DcIdaRunAppResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.error !== undefined) {
            errors_1.ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaRunAppResult();
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
        const message = createBaseDcIdaRunAppResult();
        message.error = object.error !== undefined && object.error !== null ? errors_1.ErrorResult.fromPartial(object.error) : undefined;
        return message;
    },
};
function createBaseDcIdaGetSystemInfoParam() {
    return {};
}
exports.DcIdaGetSystemInfoParam = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaGetSystemInfoParam();
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
        const message = createBaseDcIdaGetSystemInfoParam();
        return message;
    },
};
function createBaseDcIdaGetSystemInfoResult() {
    return { screenWidth: 0, screenHeight: 0 };
}
exports.DcIdaGetSystemInfoResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.screenWidth !== 0) {
            writer.uint32(8).uint32(message.screenWidth);
        }
        if (message.screenHeight !== 0) {
            writer.uint32(16).uint32(message.screenHeight);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaGetSystemInfoResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.screenWidth = reader.uint32();
                    break;
                case 2:
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
            screenWidth: isSet(object.screenWidth) ? Number(object.screenWidth) : 0,
            screenHeight: isSet(object.screenHeight) ? Number(object.screenHeight) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.screenWidth !== undefined && (obj.screenWidth = Math.round(message.screenWidth));
        message.screenHeight !== undefined && (obj.screenHeight = Math.round(message.screenHeight));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdaGetSystemInfoResult();
        message.screenWidth = object.screenWidth ?? 0;
        message.screenHeight = object.screenHeight ?? 0;
        return message;
    },
};
function createBaseDcIdaIsPortListeningParam() {
    return { port: 0 };
}
exports.DcIdaIsPortListeningParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.port !== 0) {
            writer.uint32(8).uint32(message.port);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaIsPortListeningParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.port = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { port: isSet(object.port) ? Number(object.port) : 0 };
    },
    toJSON(message) {
        const obj = {};
        message.port !== undefined && (obj.port = Math.round(message.port));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdaIsPortListeningParam();
        message.port = object.port ?? 0;
        return message;
    },
};
function createBaseDcIdaIsPortListeningResult() {
    return { isListening: false };
}
exports.DcIdaIsPortListeningResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.isListening === true) {
            writer.uint32(8).bool(message.isListening);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaIsPortListeningResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.isListening = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { isListening: isSet(object.isListening) ? Boolean(object.isListening) : false };
    },
    toJSON(message) {
        const obj = {};
        message.isListening !== undefined && (obj.isListening = message.isListening);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdaIsPortListeningResult();
        message.isListening = object.isListening ?? false;
        return message;
    },
};
function createBaseDcIdaQueryProfileParam() {
    return { profileMethods: [] };
}
exports.DcIdaQueryProfileParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.profileMethods) {
            profile_method_1.ProfileMethod.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaQueryProfileParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.profileMethods.push(profile_method_1.ProfileMethod.decode(reader, reader.uint32()));
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
            profileMethods: Array.isArray(object?.profileMethods) ? object.profileMethods.map((e) => profile_method_1.ProfileMethod.fromJSON(e)) : [],
        };
    },
    toJSON(message) {
        const obj = {};
        if (message.profileMethods) {
            obj.profileMethods = message.profileMethods.map((e) => (e ? profile_method_1.ProfileMethod.toJSON(e) : undefined));
        }
        else {
            obj.profileMethods = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdaQueryProfileParam();
        message.profileMethods = object.profileMethods?.map((e) => profile_method_1.ProfileMethod.fromPartial(e)) || [];
        return message;
    },
};
function createBaseDcIdaQueryProfileResult() {
    return { info: undefined };
}
exports.DcIdaQueryProfileResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.info !== undefined) {
            runtime_info_1.RuntimeInfo.encode(message.info, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaQueryProfileResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.info = runtime_info_1.RuntimeInfo.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { info: isSet(object.info) ? runtime_info_1.RuntimeInfo.fromJSON(object.info) : undefined };
    },
    toJSON(message) {
        const obj = {};
        message.info !== undefined && (obj.info = message.info ? runtime_info_1.RuntimeInfo.toJSON(message.info) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdaQueryProfileResult();
        message.info = object.info !== undefined && object.info !== null ? runtime_info_1.RuntimeInfo.fromPartial(object.info) : undefined;
        return message;
    },
};
function createBaseDcIdaSwitchInputBlockParam() {
    return { isBlock: false };
}
exports.DcIdaSwitchInputBlockParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.isBlock === true) {
            writer.uint32(8).bool(message.isBlock);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaSwitchInputBlockParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.isBlock = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { isBlock: isSet(object.isBlock) ? Boolean(object.isBlock) : false };
    },
    toJSON(message) {
        const obj = {};
        message.isBlock !== undefined && (obj.isBlock = message.isBlock);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdaSwitchInputBlockParam();
        message.isBlock = object.isBlock ?? false;
        return message;
    },
};
function createBaseDcIdaSwitchInputBlockResult() {
    return {};
}
exports.DcIdaSwitchInputBlockResult = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaSwitchInputBlockResult();
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
        const message = createBaseDcIdaSwitchInputBlockResult();
        return message;
    },
};
function createBaseDcIdaSubscribeAlertParam() {
    return {};
}
exports.DcIdaSubscribeAlertParam = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaSubscribeAlertParam();
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
        const message = createBaseDcIdaSubscribeAlertParam();
        return message;
    },
};
function createBaseDcIdaSubscribeAlertResult() {
    return {};
}
exports.DcIdaSubscribeAlertResult = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaSubscribeAlertResult();
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
        const message = createBaseDcIdaSubscribeAlertResult();
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
