"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcDaSetFoldableStateReturn = exports.DcDaSetFoldableStateParam = exports.DcDaGetFoldableStateReturn = exports.DcDaGetFoldableStateParam = exports.DcDaControlReturn = exports.DcDaControlParam = exports.DcDaApplyStreamingOptionReturn = exports.DcDaApplyStreamingOptionParam = exports.DcDaQueryProfileReturn = exports.DcDaQueryProfileParam = exports.DcDaConnectionReturn = exports.DcDaConnectionParam = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const errors_1 = require("../../outer/errors");
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
function createBaseDcDaGetFoldableStateParam() {
    return {};
}
exports.DcDaGetFoldableStateParam = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaGetFoldableStateParam();
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
        const message = createBaseDcDaGetFoldableStateParam();
        return message;
    },
};
function createBaseDcDaGetFoldableStateReturn() {
    return { isFoldable: false, currentState: 0, supportedStates: [] };
}
exports.DcDaGetFoldableStateReturn = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.isFoldable === true) {
            writer.uint32(8).bool(message.isFoldable);
        }
        if (message.currentState !== 0) {
            writer.uint32(16).uint32(message.currentState);
        }
        writer.uint32(26).fork();
        for (const v of message.supportedStates) {
            writer.uint32(v);
        }
        writer.ldelim();
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaGetFoldableStateReturn();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.isFoldable = reader.bool();
                    break;
                case 2:
                    message.currentState = reader.uint32();
                    break;
                case 3:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.supportedStates.push(reader.uint32());
                        }
                    }
                    else {
                        message.supportedStates.push(reader.uint32());
                    }
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
            isFoldable: isSet(object.isFoldable) ? Boolean(object.isFoldable) : false,
            currentState: isSet(object.currentState) ? Number(object.currentState) : 0,
            supportedStates: Array.isArray(object?.supportedStates) ? object.supportedStates.map((e) => Number(e)) : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.isFoldable !== undefined && (obj.isFoldable = message.isFoldable);
        message.currentState !== undefined && (obj.currentState = Math.round(message.currentState));
        if (message.supportedStates) {
            obj.supportedStates = message.supportedStates.map((e) => Math.round(e));
        }
        else {
            obj.supportedStates = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcDaGetFoldableStateReturn();
        message.isFoldable = object.isFoldable ?? false;
        message.currentState = object.currentState ?? 0;
        message.supportedStates = object.supportedStates?.map((e) => e) || [];
        return message;
    },
};
function createBaseDcDaSetFoldableStateParam() {
    return { state: 0 };
}
exports.DcDaSetFoldableStateParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.state !== 0) {
            writer.uint32(8).uint32(message.state);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaSetFoldableStateParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.state = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { state: isSet(object.state) ? Number(object.state) : 0 };
    },
    toJSON(message) {
        const obj = {};
        message.state !== undefined && (obj.state = Math.round(message.state));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcDaSetFoldableStateParam();
        message.state = object.state ?? 0;
        return message;
    },
};
function createBaseDcDaSetFoldableStateReturn() {
    return { error: undefined };
}
exports.DcDaSetFoldableStateReturn = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.error !== undefined) {
            errors_1.ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaSetFoldableStateReturn();
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
        const message = createBaseDcDaSetFoldableStateReturn();
        message.error = object.error !== undefined && object.error !== null ? errors_1.ErrorResult.fromPartial(object.error) : undefined;
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
