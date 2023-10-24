"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CfGdcDaControlResult = exports.CfGdcDaControlParam = exports.DataChannelLabel = exports.DataChannelProtocolDeviceWebSocket = exports.DataChannelProtocolDeviceHttp = exports.DataChannelProtocolRelayTcp = exports.DataChannelProtocolDefault = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const errors_1 = require("../../outer/errors");
const http_ws_1 = require("../../outer/http_ws");
const device_control_1 = require("./device_control");
function createBaseDataChannelProtocolDefault() {
    return {};
}
exports.DataChannelProtocolDefault = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDataChannelProtocolDefault();
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
        const message = createBaseDataChannelProtocolDefault();
        return message;
    },
};
function createBaseDataChannelProtocolRelayTcp() {
    return { port: 0 };
}
exports.DataChannelProtocolRelayTcp = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.port !== 0) {
            writer.uint32(8).uint32(message.port);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDataChannelProtocolRelayTcp();
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
        const message = createBaseDataChannelProtocolRelayTcp();
        message.port = object.port ?? 0;
        return message;
    },
};
function createBaseDataChannelProtocolDeviceHttp() {
    return {};
}
exports.DataChannelProtocolDeviceHttp = {
    encode(_, writer = minimal_1.default.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDataChannelProtocolDeviceHttp();
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
        const message = createBaseDataChannelProtocolDeviceHttp();
        return message;
    },
};
function createBaseDataChannelProtocolDeviceWebSocket() {
    return { connection: undefined };
}
exports.DataChannelProtocolDeviceWebSocket = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.connection !== undefined) {
            http_ws_1.WebSocketConnection.encode(message.connection, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDataChannelProtocolDeviceWebSocket();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.connection = http_ws_1.WebSocketConnection.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { connection: isSet(object.connection) ? http_ws_1.WebSocketConnection.fromJSON(object.connection) : undefined };
    },
    toJSON(message) {
        const obj = {};
        message.connection !== undefined && (obj.connection = message.connection ? http_ws_1.WebSocketConnection.toJSON(message.connection) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDataChannelProtocolDeviceWebSocket();
        message.connection = object.connection !== undefined && object.connection !== null ? http_ws_1.WebSocketConnection.fromPartial(object.connection) : undefined;
        return message;
    },
};
function createBaseDataChannelLabel() {
    return { name: '', protocol: undefined };
}
exports.DataChannelLabel = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.protocol?.$case === 'default') {
            exports.DataChannelProtocolDefault.encode(message.protocol.default, writer.uint32(18).fork()).ldelim();
        }
        if (message.protocol?.$case === 'relayTcp') {
            exports.DataChannelProtocolRelayTcp.encode(message.protocol.relayTcp, writer.uint32(26).fork()).ldelim();
        }
        if (message.protocol?.$case === 'deviceHttp') {
            exports.DataChannelProtocolDeviceHttp.encode(message.protocol.deviceHttp, writer.uint32(34).fork()).ldelim();
        }
        if (message.protocol?.$case === 'deviceWebSocket') {
            exports.DataChannelProtocolDeviceWebSocket.encode(message.protocol.deviceWebSocket, writer.uint32(42).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDataChannelLabel();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.protocol = { $case: 'default', default: exports.DataChannelProtocolDefault.decode(reader, reader.uint32()) };
                    break;
                case 3:
                    message.protocol = {
                        $case: 'relayTcp',
                        relayTcp: exports.DataChannelProtocolRelayTcp.decode(reader, reader.uint32()),
                    };
                    break;
                case 4:
                    message.protocol = {
                        $case: 'deviceHttp',
                        deviceHttp: exports.DataChannelProtocolDeviceHttp.decode(reader, reader.uint32()),
                    };
                    break;
                case 5:
                    message.protocol = {
                        $case: 'deviceWebSocket',
                        deviceWebSocket: exports.DataChannelProtocolDeviceWebSocket.decode(reader, reader.uint32()),
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
            name: isSet(object.name) ? String(object.name) : '',
            protocol: isSet(object.default)
                ? { $case: 'default', default: exports.DataChannelProtocolDefault.fromJSON(object.default) }
                : isSet(object.relayTcp)
                    ? { $case: 'relayTcp', relayTcp: exports.DataChannelProtocolRelayTcp.fromJSON(object.relayTcp) }
                    : isSet(object.deviceHttp)
                        ? { $case: 'deviceHttp', deviceHttp: exports.DataChannelProtocolDeviceHttp.fromJSON(object.deviceHttp) }
                        : isSet(object.deviceWebSocket)
                            ? {
                                $case: 'deviceWebSocket',
                                deviceWebSocket: exports.DataChannelProtocolDeviceWebSocket.fromJSON(object.deviceWebSocket),
                            }
                            : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.protocol?.$case === 'default' && (obj.default = message.protocol?.default ? exports.DataChannelProtocolDefault.toJSON(message.protocol?.default) : undefined);
        message.protocol?.$case === 'relayTcp' && (obj.relayTcp = message.protocol?.relayTcp ? exports.DataChannelProtocolRelayTcp.toJSON(message.protocol?.relayTcp) : undefined);
        message.protocol?.$case === 'deviceHttp' && (obj.deviceHttp = message.protocol?.deviceHttp ? exports.DataChannelProtocolDeviceHttp.toJSON(message.protocol?.deviceHttp) : undefined);
        message.protocol?.$case === 'deviceWebSocket' &&
            (obj.deviceWebSocket = message.protocol?.deviceWebSocket ? exports.DataChannelProtocolDeviceWebSocket.toJSON(message.protocol?.deviceWebSocket) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDataChannelLabel();
        message.name = object.name ?? '';
        if (object.protocol?.$case === 'default' && object.protocol?.default !== undefined && object.protocol?.default !== null) {
            message.protocol = { $case: 'default', default: exports.DataChannelProtocolDefault.fromPartial(object.protocol.default) };
        }
        if (object.protocol?.$case === 'relayTcp' && object.protocol?.relayTcp !== undefined && object.protocol?.relayTcp !== null) {
            message.protocol = {
                $case: 'relayTcp',
                relayTcp: exports.DataChannelProtocolRelayTcp.fromPartial(object.protocol.relayTcp),
            };
        }
        if (object.protocol?.$case === 'deviceHttp' && object.protocol?.deviceHttp !== undefined && object.protocol?.deviceHttp !== null) {
            message.protocol = {
                $case: 'deviceHttp',
                deviceHttp: exports.DataChannelProtocolDeviceHttp.fromPartial(object.protocol.deviceHttp),
            };
        }
        if (object.protocol?.$case === 'deviceWebSocket' && object.protocol?.deviceWebSocket !== undefined && object.protocol?.deviceWebSocket !== null) {
            message.protocol = {
                $case: 'deviceWebSocket',
                deviceWebSocket: exports.DataChannelProtocolDeviceWebSocket.fromPartial(object.protocol.deviceWebSocket),
            };
        }
        return message;
    },
};
function createBaseCfGdcDaControlParam() {
    return { control: undefined };
}
exports.CfGdcDaControlParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.control !== undefined) {
            device_control_1.DeviceControl.encode(message.control, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCfGdcDaControlParam();
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
        const message = createBaseCfGdcDaControlParam();
        message.control = object.control !== undefined && object.control !== null ? device_control_1.DeviceControl.fromPartial(object.control) : undefined;
        return message;
    },
};
function createBaseCfGdcDaControlResult() {
    return { error: undefined };
}
exports.CfGdcDaControlResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.error !== undefined) {
            errors_1.ErrorResult.encode(message.error, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCfGdcDaControlResult();
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
        const message = createBaseCfGdcDaControlResult();
        message.error = object.error !== undefined && object.error !== null ? errors_1.ErrorResult.fromPartial(object.error) : undefined;
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
