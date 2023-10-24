"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcDaControlReturn = exports.DcDaControlParam = exports.DcDaApplyStreamingOptionReturn = exports.DcDaApplyStreamingOptionParam = exports.DcDaQueryProfileReturn = exports.DcDaQueryProfileParam = exports.DcDaConnectionReturn = exports.DcDaConnectionParam = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const profile_method_1 = require("../../outer/profile/profile_method");
const runtime_info_1 = require("../../outer/profile/runtime_info");
const streaming_1 = require("../../outer/streaming/streaming");
const device_control_1 = require("./device_control");
function createBaseDcDaConnectionParam() {
    return { version: '', nickname: '' };
}
exports.DcDaConnectionParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.version !== '') {
            writer.uint32(10).string(message.version);
        }
        if (message.nickname !== '') {
            writer.uint32(18).string(message.nickname);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaConnectionParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.version = reader.string();
                    break;
                case 2:
                    message.nickname = reader.string();
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
            version: isSet(object.version) ? String(object.version) : '',
            nickname: isSet(object.nickname) ? String(object.nickname) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.version !== undefined && (obj.version = message.version);
        message.nickname !== undefined && (obj.nickname = message.nickname);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcDaConnectionParam();
        message.version = object.version ?? '';
        message.nickname = object.nickname ?? '';
        return message;
    },
};
function createBaseDcDaConnectionReturn() {
    return {};
}
exports.DcDaConnectionReturn = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaConnectionReturn();
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
        const message = createBaseDcDaConnectionReturn();
        return message;
    },
};
function createBaseDcDaQueryProfileParam() {
    return { profileMethods: [] };
}
exports.DcDaQueryProfileParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.profileMethods) {
            profile_method_1.ProfileMethod.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaQueryProfileParam();
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
        const message = createBaseDcDaQueryProfileParam();
        message.profileMethods = object.profileMethods?.map((e) => profile_method_1.ProfileMethod.fromPartial(e)) || [];
        return message;
    },
};
function createBaseDcDaQueryProfileReturn() {
    return { info: undefined };
}
exports.DcDaQueryProfileReturn = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.info !== undefined) {
            runtime_info_1.RuntimeInfo.encode(message.info, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaQueryProfileReturn();
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
        const message = createBaseDcDaQueryProfileReturn();
        message.info = object.info !== undefined && object.info !== null ? runtime_info_1.RuntimeInfo.fromPartial(object.info) : undefined;
        return message;
    },
};
function createBaseDcDaApplyStreamingOptionParam() {
    return { option: undefined };
}
exports.DcDaApplyStreamingOptionParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.option !== undefined) {
            streaming_1.StreamingOption.encode(message.option, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaApplyStreamingOptionParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.option = streaming_1.StreamingOption.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { option: isSet(object.option) ? streaming_1.StreamingOption.fromJSON(object.option) : undefined };
    },
    toJSON(message) {
        const obj = {};
        message.option !== undefined && (obj.option = message.option ? streaming_1.StreamingOption.toJSON(message.option) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcDaApplyStreamingOptionParam();
        message.option = object.option !== undefined && object.option !== null ? streaming_1.StreamingOption.fromPartial(object.option) : undefined;
        return message;
    },
};
function createBaseDcDaApplyStreamingOptionReturn() {
    return {};
}
exports.DcDaApplyStreamingOptionReturn = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaApplyStreamingOptionReturn();
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
        const message = createBaseDcDaApplyStreamingOptionReturn();
        return message;
    },
};
function createBaseDcDaControlParam() {
    return { control: undefined };
}
exports.DcDaControlParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.control !== undefined) {
            device_control_1.DeviceControl.encode(message.control, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaControlParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.control = device_control_1.DeviceControl.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { control: isSet(object.control) ? device_control_1.DeviceControl.fromJSON(object.control) : undefined };
    },
    toJSON(message) {
        const obj = {};
        message.control !== undefined && (obj.control = message.control ? device_control_1.DeviceControl.toJSON(message.control) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcDaControlParam();
        message.control = object.control !== undefined && object.control !== null ? device_control_1.DeviceControl.fromPartial(object.control) : undefined;
        return message;
    },
};
function createBaseDcDaControlReturn() {
    return {};
}
exports.DcDaControlReturn = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaControlReturn();
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
        const message = createBaseDcDaControlReturn();
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
