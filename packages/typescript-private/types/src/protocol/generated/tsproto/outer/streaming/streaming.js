"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingAnswer = exports.StreamingOffer = exports.StartStreaming = exports.StreamingOption = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const errors_1 = require("../errors");
const platform_1 = require("../platform");
const screencapture_option_1 = require("./screencapture_option");
const webrtc_1 = require("./webrtc");
function createBaseStreamingOption() {
    return { screen: undefined };
}
exports.StreamingOption = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.screen !== undefined) {
            screencapture_option_1.ScreenCaptureOption.encode(message.screen, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStreamingOption();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.screen = screencapture_option_1.ScreenCaptureOption.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { screen: isSet(object.screen) ? screencapture_option_1.ScreenCaptureOption.fromJSON(object.screen) : undefined };
    },
    toJSON(message) {
        const obj = {};
        message.screen !== undefined && (obj.screen = message.screen ? screencapture_option_1.ScreenCaptureOption.toJSON(message.screen) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseStreamingOption();
        message.screen = object.screen !== undefined && object.screen !== null ? screencapture_option_1.ScreenCaptureOption.fromPartial(object.screen) : undefined;
        return message;
    },
};
function createBaseStartStreaming() {
    return {
        peerDescription: undefined,
        option: undefined,
        turnServerUrl: '',
        turnServerUsername: '',
        turnServerPassword: '',
        platform: 0,
    };
}
exports.StartStreaming = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.peerDescription !== undefined) {
            webrtc_1.ProtoRTCPeerDescription.encode(message.peerDescription, writer.uint32(10).fork()).ldelim();
        }
        if (message.option !== undefined) {
            exports.StreamingOption.encode(message.option, writer.uint32(18).fork()).ldelim();
        }
        if (message.turnServerUrl !== '') {
            writer.uint32(26).string(message.turnServerUrl);
        }
        if (message.turnServerUsername !== '') {
            writer.uint32(34).string(message.turnServerUsername);
        }
        if (message.turnServerPassword !== '') {
            writer.uint32(42).string(message.turnServerPassword);
        }
        if (message.platform !== 0) {
            writer.uint32(48).int32(message.platform);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStartStreaming();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.peerDescription = webrtc_1.ProtoRTCPeerDescription.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.option = exports.StreamingOption.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.turnServerUrl = reader.string();
                    break;
                case 4:
                    message.turnServerUsername = reader.string();
                    break;
                case 5:
                    message.turnServerPassword = reader.string();
                    break;
                case 6:
                    message.platform = reader.int32();
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
            peerDescription: isSet(object.peerDescription) ? webrtc_1.ProtoRTCPeerDescription.fromJSON(object.peerDescription) : undefined,
            option: isSet(object.option) ? exports.StreamingOption.fromJSON(object.option) : undefined,
            turnServerUrl: isSet(object.turnServerUrl) ? String(object.turnServerUrl) : '',
            turnServerUsername: isSet(object.turnServerUsername) ? String(object.turnServerUsername) : '',
            turnServerPassword: isSet(object.turnServerPassword) ? String(object.turnServerPassword) : '',
            platform: isSet(object.platform) ? (0, platform_1.platformFromJSON)(object.platform) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.peerDescription !== undefined && (obj.peerDescription = message.peerDescription ? webrtc_1.ProtoRTCPeerDescription.toJSON(message.peerDescription) : undefined);
        message.option !== undefined && (obj.option = message.option ? exports.StreamingOption.toJSON(message.option) : undefined);
        message.turnServerUrl !== undefined && (obj.turnServerUrl = message.turnServerUrl);
        message.turnServerUsername !== undefined && (obj.turnServerUsername = message.turnServerUsername);
        message.turnServerPassword !== undefined && (obj.turnServerPassword = message.turnServerPassword);
        message.platform !== undefined && (obj.platform = (0, platform_1.platformToJSON)(message.platform));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseStartStreaming();
        message.peerDescription = object.peerDescription !== undefined && object.peerDescription !== null ? webrtc_1.ProtoRTCPeerDescription.fromPartial(object.peerDescription) : undefined;
        message.option = object.option !== undefined && object.option !== null ? exports.StreamingOption.fromPartial(object.option) : undefined;
        message.turnServerUrl = object.turnServerUrl ?? '';
        message.turnServerUsername = object.turnServerUsername ?? '';
        message.turnServerPassword = object.turnServerPassword ?? '';
        message.platform = object.platform ?? 0;
        return message;
    },
};
function createBaseStreamingOffer() {
    return { serial: '', value: undefined };
}
exports.StreamingOffer = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.serial !== '') {
            writer.uint32(10).string(message.serial);
        }
        if (message.value?.$case === 'startStreaming') {
            exports.StartStreaming.encode(message.value.startStreaming, writer.uint32(18).fork()).ldelim();
        }
        if (message.value?.$case === 'iceCandidate') {
            webrtc_1.ProtoRTCIceCandidateInit.encode(message.value.iceCandidate, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStreamingOffer();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.serial = reader.string();
                    break;
                case 2:
                    message.value = { $case: 'startStreaming', startStreaming: exports.StartStreaming.decode(reader, reader.uint32()) };
                    break;
                case 3:
                    message.value = {
                        $case: 'iceCandidate',
                        iceCandidate: webrtc_1.ProtoRTCIceCandidateInit.decode(reader, reader.uint32()),
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
            serial: isSet(object.serial) ? String(object.serial) : '',
            value: isSet(object.startStreaming)
                ? { $case: 'startStreaming', startStreaming: exports.StartStreaming.fromJSON(object.startStreaming) }
                : isSet(object.iceCandidate)
                    ? { $case: 'iceCandidate', iceCandidate: webrtc_1.ProtoRTCIceCandidateInit.fromJSON(object.iceCandidate) }
                    : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.serial !== undefined && (obj.serial = message.serial);
        message.value?.$case === 'startStreaming' && (obj.startStreaming = message.value?.startStreaming ? exports.StartStreaming.toJSON(message.value?.startStreaming) : undefined);
        message.value?.$case === 'iceCandidate' && (obj.iceCandidate = message.value?.iceCandidate ? webrtc_1.ProtoRTCIceCandidateInit.toJSON(message.value?.iceCandidate) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseStreamingOffer();
        message.serial = object.serial ?? '';
        if (object.value?.$case === 'startStreaming' && object.value?.startStreaming !== undefined && object.value?.startStreaming !== null) {
            message.value = {
                $case: 'startStreaming',
                startStreaming: exports.StartStreaming.fromPartial(object.value.startStreaming),
            };
        }
        if (object.value?.$case === 'iceCandidate' && object.value?.iceCandidate !== undefined && object.value?.iceCandidate !== null) {
            message.value = {
                $case: 'iceCandidate',
                iceCandidate: webrtc_1.ProtoRTCIceCandidateInit.fromPartial(object.value.iceCandidate),
            };
        }
        return message;
    },
};
function createBaseStreamingAnswer() {
    return { value: undefined };
}
exports.StreamingAnswer = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'peerDescription') {
            webrtc_1.ProtoRTCPeerDescription.encode(message.value.peerDescription, writer.uint32(10).fork()).ldelim();
        }
        if (message.value?.$case === 'iceCandidate') {
            webrtc_1.ProtoRTCIceCandidateInit.encode(message.value.iceCandidate, writer.uint32(18).fork()).ldelim();
        }
        if (message.value?.$case === 'errorResult') {
            errors_1.ErrorResult.encode(message.value.errorResult, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStreamingAnswer();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.value = {
                        $case: 'peerDescription',
                        peerDescription: webrtc_1.ProtoRTCPeerDescription.decode(reader, reader.uint32()),
                    };
                    break;
                case 2:
                    message.value = {
                        $case: 'iceCandidate',
                        iceCandidate: webrtc_1.ProtoRTCIceCandidateInit.decode(reader, reader.uint32()),
                    };
                    break;
                case 3:
                    message.value = { $case: 'errorResult', errorResult: errors_1.ErrorResult.decode(reader, reader.uint32()) };
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
            value: isSet(object.peerDescription)
                ? { $case: 'peerDescription', peerDescription: webrtc_1.ProtoRTCPeerDescription.fromJSON(object.peerDescription) }
                : isSet(object.iceCandidate)
                    ? { $case: 'iceCandidate', iceCandidate: webrtc_1.ProtoRTCIceCandidateInit.fromJSON(object.iceCandidate) }
                    : isSet(object.errorResult)
                        ? { $case: 'errorResult', errorResult: errors_1.ErrorResult.fromJSON(object.errorResult) }
                        : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'peerDescription' &&
            (obj.peerDescription = message.value?.peerDescription ? webrtc_1.ProtoRTCPeerDescription.toJSON(message.value?.peerDescription) : undefined);
        message.value?.$case === 'iceCandidate' && (obj.iceCandidate = message.value?.iceCandidate ? webrtc_1.ProtoRTCIceCandidateInit.toJSON(message.value?.iceCandidate) : undefined);
        message.value?.$case === 'errorResult' && (obj.errorResult = message.value?.errorResult ? errors_1.ErrorResult.toJSON(message.value?.errorResult) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseStreamingAnswer();
        if (object.value?.$case === 'peerDescription' && object.value?.peerDescription !== undefined && object.value?.peerDescription !== null) {
            message.value = {
                $case: 'peerDescription',
                peerDescription: webrtc_1.ProtoRTCPeerDescription.fromPartial(object.value.peerDescription),
            };
        }
        if (object.value?.$case === 'iceCandidate' && object.value?.iceCandidate !== undefined && object.value?.iceCandidate !== null) {
            message.value = {
                $case: 'iceCandidate',
                iceCandidate: webrtc_1.ProtoRTCIceCandidateInit.fromPartial(object.value.iceCandidate),
            };
        }
        if (object.value?.$case === 'errorResult' && object.value?.errorResult !== undefined && object.value?.errorResult !== null) {
            message.value = { $case: 'errorResult', errorResult: errors_1.ErrorResult.fromPartial(object.value.errorResult) };
        }
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
