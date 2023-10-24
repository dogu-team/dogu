"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcGdcResult = exports.DcGdcParam = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const dc_gdc_1 = require("../types/dc_gdc");
function createBaseDcGdcParam() {
    return { value: undefined };
}
exports.DcGdcParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'dcGdcUpdateDevicelistParam') {
            dc_gdc_1.DcGdcUpdateDeviceListParam.encode(message.value.dcGdcUpdateDevicelistParam, writer.uint32(82).fork()).ldelim();
        }
        if (message.value?.$case === 'dcGdcStartScreenRecordParam') {
            dc_gdc_1.DcGdcStartScreenRecordParam.encode(message.value.dcGdcStartScreenRecordParam, writer.uint32(106).fork()).ldelim();
        }
        if (message.value?.$case === 'dcGdcStopScreenRecordParam') {
            dc_gdc_1.DcGdcStopScreenRecordParam.encode(message.value.dcGdcStopScreenRecordParam, writer.uint32(114).fork()).ldelim();
        }
        if (message.value?.$case === 'dcGdcGetSurfaceStatusParam') {
            dc_gdc_1.DcGdcGetSurfaceStatusParam.encode(message.value.dcGdcGetSurfaceStatusParam, writer.uint32(122).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 10:
                    message.value = {
                        $case: 'dcGdcUpdateDevicelistParam',
                        dcGdcUpdateDevicelistParam: dc_gdc_1.DcGdcUpdateDeviceListParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 13:
                    message.value = {
                        $case: 'dcGdcStartScreenRecordParam',
                        dcGdcStartScreenRecordParam: dc_gdc_1.DcGdcStartScreenRecordParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 14:
                    message.value = {
                        $case: 'dcGdcStopScreenRecordParam',
                        dcGdcStopScreenRecordParam: dc_gdc_1.DcGdcStopScreenRecordParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 15:
                    message.value = {
                        $case: 'dcGdcGetSurfaceStatusParam',
                        dcGdcGetSurfaceStatusParam: dc_gdc_1.DcGdcGetSurfaceStatusParam.decode(reader, reader.uint32()),
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
            value: isSet(object.dcGdcUpdateDevicelistParam)
                ? {
                    $case: 'dcGdcUpdateDevicelistParam',
                    dcGdcUpdateDevicelistParam: dc_gdc_1.DcGdcUpdateDeviceListParam.fromJSON(object.dcGdcUpdateDevicelistParam),
                }
                : isSet(object.dcGdcStartScreenRecordParam)
                    ? {
                        $case: 'dcGdcStartScreenRecordParam',
                        dcGdcStartScreenRecordParam: dc_gdc_1.DcGdcStartScreenRecordParam.fromJSON(object.dcGdcStartScreenRecordParam),
                    }
                    : isSet(object.dcGdcStopScreenRecordParam)
                        ? {
                            $case: 'dcGdcStopScreenRecordParam',
                            dcGdcStopScreenRecordParam: dc_gdc_1.DcGdcStopScreenRecordParam.fromJSON(object.dcGdcStopScreenRecordParam),
                        }
                        : isSet(object.dcGdcGetSurfaceStatusParam)
                            ? {
                                $case: 'dcGdcGetSurfaceStatusParam',
                                dcGdcGetSurfaceStatusParam: dc_gdc_1.DcGdcGetSurfaceStatusParam.fromJSON(object.dcGdcGetSurfaceStatusParam),
                            }
                            : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'dcGdcUpdateDevicelistParam' &&
            (obj.dcGdcUpdateDevicelistParam = message.value?.dcGdcUpdateDevicelistParam ? dc_gdc_1.DcGdcUpdateDeviceListParam.toJSON(message.value?.dcGdcUpdateDevicelistParam) : undefined);
        message.value?.$case === 'dcGdcStartScreenRecordParam' &&
            (obj.dcGdcStartScreenRecordParam = message.value?.dcGdcStartScreenRecordParam ? dc_gdc_1.DcGdcStartScreenRecordParam.toJSON(message.value?.dcGdcStartScreenRecordParam) : undefined);
        message.value?.$case === 'dcGdcStopScreenRecordParam' &&
            (obj.dcGdcStopScreenRecordParam = message.value?.dcGdcStopScreenRecordParam ? dc_gdc_1.DcGdcStopScreenRecordParam.toJSON(message.value?.dcGdcStopScreenRecordParam) : undefined);
        message.value?.$case === 'dcGdcGetSurfaceStatusParam' &&
            (obj.dcGdcGetSurfaceStatusParam = message.value?.dcGdcGetSurfaceStatusParam ? dc_gdc_1.DcGdcGetSurfaceStatusParam.toJSON(message.value?.dcGdcGetSurfaceStatusParam) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcParam();
        if (object.value?.$case === 'dcGdcUpdateDevicelistParam' && object.value?.dcGdcUpdateDevicelistParam !== undefined && object.value?.dcGdcUpdateDevicelistParam !== null) {
            message.value = {
                $case: 'dcGdcUpdateDevicelistParam',
                dcGdcUpdateDevicelistParam: dc_gdc_1.DcGdcUpdateDeviceListParam.fromPartial(object.value.dcGdcUpdateDevicelistParam),
            };
        }
        if (object.value?.$case === 'dcGdcStartScreenRecordParam' && object.value?.dcGdcStartScreenRecordParam !== undefined && object.value?.dcGdcStartScreenRecordParam !== null) {
            message.value = {
                $case: 'dcGdcStartScreenRecordParam',
                dcGdcStartScreenRecordParam: dc_gdc_1.DcGdcStartScreenRecordParam.fromPartial(object.value.dcGdcStartScreenRecordParam),
            };
        }
        if (object.value?.$case === 'dcGdcStopScreenRecordParam' && object.value?.dcGdcStopScreenRecordParam !== undefined && object.value?.dcGdcStopScreenRecordParam !== null) {
            message.value = {
                $case: 'dcGdcStopScreenRecordParam',
                dcGdcStopScreenRecordParam: dc_gdc_1.DcGdcStopScreenRecordParam.fromPartial(object.value.dcGdcStopScreenRecordParam),
            };
        }
        if (object.value?.$case === 'dcGdcGetSurfaceStatusParam' && object.value?.dcGdcGetSurfaceStatusParam !== undefined && object.value?.dcGdcGetSurfaceStatusParam !== null) {
            message.value = {
                $case: 'dcGdcGetSurfaceStatusParam',
                dcGdcGetSurfaceStatusParam: dc_gdc_1.DcGdcGetSurfaceStatusParam.fromPartial(object.value.dcGdcGetSurfaceStatusParam),
            };
        }
        return message;
    },
};
function createBaseDcGdcResult() {
    return { value: undefined };
}
exports.DcGdcResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'dcGdcUpdateDevicelistResult') {
            dc_gdc_1.DcGdcUpdateDeviceListResult.encode(message.value.dcGdcUpdateDevicelistResult, writer.uint32(82).fork()).ldelim();
        }
        if (message.value?.$case === 'dcGdcStartScreenRecordResult') {
            dc_gdc_1.DcGdcStartScreenRecordResult.encode(message.value.dcGdcStartScreenRecordResult, writer.uint32(106).fork()).ldelim();
        }
        if (message.value?.$case === 'dcGdcStopScreenRecordResult') {
            dc_gdc_1.DcGdcStopScreenRecordResult.encode(message.value.dcGdcStopScreenRecordResult, writer.uint32(114).fork()).ldelim();
        }
        if (message.value?.$case === 'dcGdcGetSurfaceStatusResult') {
            dc_gdc_1.DcGdcGetSurfaceStatusResult.encode(message.value.dcGdcGetSurfaceStatusResult, writer.uint32(122).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcGdcResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 10:
                    message.value = {
                        $case: 'dcGdcUpdateDevicelistResult',
                        dcGdcUpdateDevicelistResult: dc_gdc_1.DcGdcUpdateDeviceListResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 13:
                    message.value = {
                        $case: 'dcGdcStartScreenRecordResult',
                        dcGdcStartScreenRecordResult: dc_gdc_1.DcGdcStartScreenRecordResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 14:
                    message.value = {
                        $case: 'dcGdcStopScreenRecordResult',
                        dcGdcStopScreenRecordResult: dc_gdc_1.DcGdcStopScreenRecordResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 15:
                    message.value = {
                        $case: 'dcGdcGetSurfaceStatusResult',
                        dcGdcGetSurfaceStatusResult: dc_gdc_1.DcGdcGetSurfaceStatusResult.decode(reader, reader.uint32()),
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
            value: isSet(object.dcGdcUpdateDevicelistResult)
                ? {
                    $case: 'dcGdcUpdateDevicelistResult',
                    dcGdcUpdateDevicelistResult: dc_gdc_1.DcGdcUpdateDeviceListResult.fromJSON(object.dcGdcUpdateDevicelistResult),
                }
                : isSet(object.dcGdcStartScreenRecordResult)
                    ? {
                        $case: 'dcGdcStartScreenRecordResult',
                        dcGdcStartScreenRecordResult: dc_gdc_1.DcGdcStartScreenRecordResult.fromJSON(object.dcGdcStartScreenRecordResult),
                    }
                    : isSet(object.dcGdcStopScreenRecordResult)
                        ? {
                            $case: 'dcGdcStopScreenRecordResult',
                            dcGdcStopScreenRecordResult: dc_gdc_1.DcGdcStopScreenRecordResult.fromJSON(object.dcGdcStopScreenRecordResult),
                        }
                        : isSet(object.dcGdcGetSurfaceStatusResult)
                            ? {
                                $case: 'dcGdcGetSurfaceStatusResult',
                                dcGdcGetSurfaceStatusResult: dc_gdc_1.DcGdcGetSurfaceStatusResult.fromJSON(object.dcGdcGetSurfaceStatusResult),
                            }
                            : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'dcGdcUpdateDevicelistResult' &&
            (obj.dcGdcUpdateDevicelistResult = message.value?.dcGdcUpdateDevicelistResult ? dc_gdc_1.DcGdcUpdateDeviceListResult.toJSON(message.value?.dcGdcUpdateDevicelistResult) : undefined);
        message.value?.$case === 'dcGdcStartScreenRecordResult' &&
            (obj.dcGdcStartScreenRecordResult = message.value?.dcGdcStartScreenRecordResult
                ? dc_gdc_1.DcGdcStartScreenRecordResult.toJSON(message.value?.dcGdcStartScreenRecordResult)
                : undefined);
        message.value?.$case === 'dcGdcStopScreenRecordResult' &&
            (obj.dcGdcStopScreenRecordResult = message.value?.dcGdcStopScreenRecordResult ? dc_gdc_1.DcGdcStopScreenRecordResult.toJSON(message.value?.dcGdcStopScreenRecordResult) : undefined);
        message.value?.$case === 'dcGdcGetSurfaceStatusResult' &&
            (obj.dcGdcGetSurfaceStatusResult = message.value?.dcGdcGetSurfaceStatusResult ? dc_gdc_1.DcGdcGetSurfaceStatusResult.toJSON(message.value?.dcGdcGetSurfaceStatusResult) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcGdcResult();
        if (object.value?.$case === 'dcGdcUpdateDevicelistResult' && object.value?.dcGdcUpdateDevicelistResult !== undefined && object.value?.dcGdcUpdateDevicelistResult !== null) {
            message.value = {
                $case: 'dcGdcUpdateDevicelistResult',
                dcGdcUpdateDevicelistResult: dc_gdc_1.DcGdcUpdateDeviceListResult.fromPartial(object.value.dcGdcUpdateDevicelistResult),
            };
        }
        if (object.value?.$case === 'dcGdcStartScreenRecordResult' && object.value?.dcGdcStartScreenRecordResult !== undefined && object.value?.dcGdcStartScreenRecordResult !== null) {
            message.value = {
                $case: 'dcGdcStartScreenRecordResult',
                dcGdcStartScreenRecordResult: dc_gdc_1.DcGdcStartScreenRecordResult.fromPartial(object.value.dcGdcStartScreenRecordResult),
            };
        }
        if (object.value?.$case === 'dcGdcStopScreenRecordResult' && object.value?.dcGdcStopScreenRecordResult !== undefined && object.value?.dcGdcStopScreenRecordResult !== null) {
            message.value = {
                $case: 'dcGdcStopScreenRecordResult',
                dcGdcStopScreenRecordResult: dc_gdc_1.DcGdcStopScreenRecordResult.fromPartial(object.value.dcGdcStopScreenRecordResult),
            };
        }
        if (object.value?.$case === 'dcGdcGetSurfaceStatusResult' && object.value?.dcGdcGetSurfaceStatusResult !== undefined && object.value?.dcGdcGetSurfaceStatusResult !== null) {
            message.value = {
                $case: 'dcGdcGetSurfaceStatusResult',
                dcGdcGetSurfaceStatusResult: dc_gdc_1.DcGdcGetSurfaceStatusResult.fromPartial(object.value.dcGdcGetSurfaceStatusResult),
            };
        }
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
