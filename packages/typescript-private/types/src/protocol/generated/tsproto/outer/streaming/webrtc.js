"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtoRTCIceCandidateInit = exports.ProtoRTCPeerDescription = exports.protoRTCSdpTypeToJSON = exports.protoRTCSdpTypeFromJSON = exports.ProtoRTCSdpType = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
var ProtoRTCSdpType;
(function (ProtoRTCSdpType) {
    ProtoRTCSdpType[ProtoRTCSdpType["PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED"] = 0] = "PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED";
    ProtoRTCSdpType[ProtoRTCSdpType["PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER"] = 1] = "PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER";
    ProtoRTCSdpType[ProtoRTCSdpType["PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER"] = 2] = "PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER";
    ProtoRTCSdpType[ProtoRTCSdpType["PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER"] = 3] = "PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER";
    ProtoRTCSdpType[ProtoRTCSdpType["PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK"] = 4] = "PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK";
    ProtoRTCSdpType[ProtoRTCSdpType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(ProtoRTCSdpType = exports.ProtoRTCSdpType || (exports.ProtoRTCSdpType = {}));
function protoRTCSdpTypeFromJSON(object) {
    switch (object) {
        case 0:
        case 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED':
            return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED;
        case 1:
        case 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER':
            return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER;
        case 2:
        case 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER':
            return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER;
        case 3:
        case 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER':
            return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER;
        case 4:
        case 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK':
            return ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return ProtoRTCSdpType.UNRECOGNIZED;
    }
}
exports.protoRTCSdpTypeFromJSON = protoRTCSdpTypeFromJSON;
function protoRTCSdpTypeToJSON(object) {
    switch (object) {
        case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED:
            return 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_UNSPECIFIED';
        case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER:
            return 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_OFFER';
        case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER:
            return 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ANSWER';
        case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER:
            return 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_PRANSWER';
        case ProtoRTCSdpType.PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK:
            return 'PROTO_RTCSDP_TYPE_RTCSDP_TYPE_ROLLBACK';
        case ProtoRTCSdpType.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
exports.protoRTCSdpTypeToJSON = protoRTCSdpTypeToJSON;
function createBaseProtoRTCPeerDescription() {
    return { sdpBase64: '', type: 0 };
}
exports.ProtoRTCPeerDescription = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.sdpBase64 !== '') {
            writer.uint32(10).string(message.sdpBase64);
        }
        if (message.type !== 0) {
            writer.uint32(16).int32(message.type);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseProtoRTCPeerDescription();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sdpBase64 = reader.string();
                    break;
                case 2:
                    message.type = reader.int32();
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
            sdpBase64: isSet(object.sdpBase64) ? String(object.sdpBase64) : '',
            type: isSet(object.type) ? protoRTCSdpTypeFromJSON(object.type) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.sdpBase64 !== undefined && (obj.sdpBase64 = message.sdpBase64);
        message.type !== undefined && (obj.type = protoRTCSdpTypeToJSON(message.type));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseProtoRTCPeerDescription();
        message.sdpBase64 = object.sdpBase64 ?? '';
        message.type = object.type ?? 0;
        return message;
    },
};
function createBaseProtoRTCIceCandidateInit() {
    return { candidate: '', sdpMlineIndex: 0, sdpMid: '', usernameFragment: '' };
}
exports.ProtoRTCIceCandidateInit = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.candidate !== '') {
            writer.uint32(10).string(message.candidate);
        }
        if (message.sdpMlineIndex !== 0) {
            writer.uint32(16).int32(message.sdpMlineIndex);
        }
        if (message.sdpMid !== '') {
            writer.uint32(26).string(message.sdpMid);
        }
        if (message.usernameFragment !== '') {
            writer.uint32(34).string(message.usernameFragment);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseProtoRTCIceCandidateInit();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.candidate = reader.string();
                    break;
                case 2:
                    message.sdpMlineIndex = reader.int32();
                    break;
                case 3:
                    message.sdpMid = reader.string();
                    break;
                case 4:
                    message.usernameFragment = reader.string();
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
            candidate: isSet(object.candidate) ? String(object.candidate) : '',
            sdpMlineIndex: isSet(object.sdpMlineIndex) ? Number(object.sdpMlineIndex) : 0,
            sdpMid: isSet(object.sdpMid) ? String(object.sdpMid) : '',
            usernameFragment: isSet(object.usernameFragment) ? String(object.usernameFragment) : '',
        };
    },
    toJSON(message) {
        const obj = {};
        message.candidate !== undefined && (obj.candidate = message.candidate);
        message.sdpMlineIndex !== undefined && (obj.sdpMlineIndex = Math.round(message.sdpMlineIndex));
        message.sdpMid !== undefined && (obj.sdpMid = message.sdpMid);
        message.usernameFragment !== undefined && (obj.usernameFragment = message.usernameFragment);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseProtoRTCIceCandidateInit();
        message.candidate = object.candidate ?? '';
        message.sdpMlineIndex = object.sdpMlineIndex ?? 0;
        message.sdpMid = object.sdpMid ?? '';
        message.usernameFragment = object.usernameFragment ?? '';
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
