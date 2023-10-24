"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcIdcResult = exports.DcIdcParam = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const dc_idc_1 = require("../types/dc_idc");
function createBaseDcIdcParam() {
    return { value: undefined };
}
exports.DcIdcParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'dcIdcScanIdsParam') {
            dc_idc_1.DcIdcScanIdsParam.encode(message.value.dcIdcScanIdsParam, writer.uint32(10).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdcOpenGrpcClientParam') {
            dc_idc_1.DcIdcOpenGrpcClientParam.encode(message.value.dcIdcOpenGrpcClientParam, writer.uint32(26).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdcCheckGrpcHealthParam') {
            dc_idc_1.DcIdcCheckGrpcHealthParam.encode(message.value.dcIdcCheckGrpcHealthParam, writer.uint32(34).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdcStartScreenRecordParam') {
            dc_idc_1.DcIdcStartScreenRecordParam.encode(message.value.dcIdcStartScreenRecordParam, writer.uint32(42).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdcStopScreenRecordParam') {
            dc_idc_1.DcIdcStopScreenRecordParam.encode(message.value.dcIdcStopScreenRecordParam, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdcParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.value = {
                        $case: 'dcIdcScanIdsParam',
                        dcIdcScanIdsParam: dc_idc_1.DcIdcScanIdsParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 3:
                    message.value = {
                        $case: 'dcIdcOpenGrpcClientParam',
                        dcIdcOpenGrpcClientParam: dc_idc_1.DcIdcOpenGrpcClientParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 4:
                    message.value = {
                        $case: 'dcIdcCheckGrpcHealthParam',
                        dcIdcCheckGrpcHealthParam: dc_idc_1.DcIdcCheckGrpcHealthParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 5:
                    message.value = {
                        $case: 'dcIdcStartScreenRecordParam',
                        dcIdcStartScreenRecordParam: dc_idc_1.DcIdcStartScreenRecordParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 6:
                    message.value = {
                        $case: 'dcIdcStopScreenRecordParam',
                        dcIdcStopScreenRecordParam: dc_idc_1.DcIdcStopScreenRecordParam.decode(reader, reader.uint32()),
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
            value: isSet(object.dcIdcScanIdsParam)
                ? { $case: 'dcIdcScanIdsParam', dcIdcScanIdsParam: dc_idc_1.DcIdcScanIdsParam.fromJSON(object.dcIdcScanIdsParam) }
                : isSet(object.dcIdcOpenGrpcClientParam)
                    ? {
                        $case: 'dcIdcOpenGrpcClientParam',
                        dcIdcOpenGrpcClientParam: dc_idc_1.DcIdcOpenGrpcClientParam.fromJSON(object.dcIdcOpenGrpcClientParam),
                    }
                    : isSet(object.dcIdcCheckGrpcHealthParam)
                        ? {
                            $case: 'dcIdcCheckGrpcHealthParam',
                            dcIdcCheckGrpcHealthParam: dc_idc_1.DcIdcCheckGrpcHealthParam.fromJSON(object.dcIdcCheckGrpcHealthParam),
                        }
                        : isSet(object.dcIdcStartScreenRecordParam)
                            ? {
                                $case: 'dcIdcStartScreenRecordParam',
                                dcIdcStartScreenRecordParam: dc_idc_1.DcIdcStartScreenRecordParam.fromJSON(object.dcIdcStartScreenRecordParam),
                            }
                            : isSet(object.dcIdcStopScreenRecordParam)
                                ? {
                                    $case: 'dcIdcStopScreenRecordParam',
                                    dcIdcStopScreenRecordParam: dc_idc_1.DcIdcStopScreenRecordParam.fromJSON(object.dcIdcStopScreenRecordParam),
                                }
                                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'dcIdcScanIdsParam' &&
            (obj.dcIdcScanIdsParam = message.value?.dcIdcScanIdsParam ? dc_idc_1.DcIdcScanIdsParam.toJSON(message.value?.dcIdcScanIdsParam) : undefined);
        message.value?.$case === 'dcIdcOpenGrpcClientParam' &&
            (obj.dcIdcOpenGrpcClientParam = message.value?.dcIdcOpenGrpcClientParam ? dc_idc_1.DcIdcOpenGrpcClientParam.toJSON(message.value?.dcIdcOpenGrpcClientParam) : undefined);
        message.value?.$case === 'dcIdcCheckGrpcHealthParam' &&
            (obj.dcIdcCheckGrpcHealthParam = message.value?.dcIdcCheckGrpcHealthParam ? dc_idc_1.DcIdcCheckGrpcHealthParam.toJSON(message.value?.dcIdcCheckGrpcHealthParam) : undefined);
        message.value?.$case === 'dcIdcStartScreenRecordParam' &&
            (obj.dcIdcStartScreenRecordParam = message.value?.dcIdcStartScreenRecordParam ? dc_idc_1.DcIdcStartScreenRecordParam.toJSON(message.value?.dcIdcStartScreenRecordParam) : undefined);
        message.value?.$case === 'dcIdcStopScreenRecordParam' &&
            (obj.dcIdcStopScreenRecordParam = message.value?.dcIdcStopScreenRecordParam ? dc_idc_1.DcIdcStopScreenRecordParam.toJSON(message.value?.dcIdcStopScreenRecordParam) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdcParam();
        if (object.value?.$case === 'dcIdcScanIdsParam' && object.value?.dcIdcScanIdsParam !== undefined && object.value?.dcIdcScanIdsParam !== null) {
            message.value = {
                $case: 'dcIdcScanIdsParam',
                dcIdcScanIdsParam: dc_idc_1.DcIdcScanIdsParam.fromPartial(object.value.dcIdcScanIdsParam),
            };
        }
        if (object.value?.$case === 'dcIdcOpenGrpcClientParam' && object.value?.dcIdcOpenGrpcClientParam !== undefined && object.value?.dcIdcOpenGrpcClientParam !== null) {
            message.value = {
                $case: 'dcIdcOpenGrpcClientParam',
                dcIdcOpenGrpcClientParam: dc_idc_1.DcIdcOpenGrpcClientParam.fromPartial(object.value.dcIdcOpenGrpcClientParam),
            };
        }
        if (object.value?.$case === 'dcIdcCheckGrpcHealthParam' && object.value?.dcIdcCheckGrpcHealthParam !== undefined && object.value?.dcIdcCheckGrpcHealthParam !== null) {
            message.value = {
                $case: 'dcIdcCheckGrpcHealthParam',
                dcIdcCheckGrpcHealthParam: dc_idc_1.DcIdcCheckGrpcHealthParam.fromPartial(object.value.dcIdcCheckGrpcHealthParam),
            };
        }
        if (object.value?.$case === 'dcIdcStartScreenRecordParam' && object.value?.dcIdcStartScreenRecordParam !== undefined && object.value?.dcIdcStartScreenRecordParam !== null) {
            message.value = {
                $case: 'dcIdcStartScreenRecordParam',
                dcIdcStartScreenRecordParam: dc_idc_1.DcIdcStartScreenRecordParam.fromPartial(object.value.dcIdcStartScreenRecordParam),
            };
        }
        if (object.value?.$case === 'dcIdcStopScreenRecordParam' && object.value?.dcIdcStopScreenRecordParam !== undefined && object.value?.dcIdcStopScreenRecordParam !== null) {
            message.value = {
                $case: 'dcIdcStopScreenRecordParam',
                dcIdcStopScreenRecordParam: dc_idc_1.DcIdcStopScreenRecordParam.fromPartial(object.value.dcIdcStopScreenRecordParam),
            };
        }
        return message;
    },
};
function createBaseDcIdcResult() {
    return { value: undefined };
}
exports.DcIdcResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.value?.$case === 'dcIdcScanIdsResult') {
            dc_idc_1.DcIdcScanIdsResult.encode(message.value.dcIdcScanIdsResult, writer.uint32(10).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdcOpenGrpcClientResult') {
            dc_idc_1.DcIdcOpenGrpcClientResult.encode(message.value.dcIdcOpenGrpcClientResult, writer.uint32(26).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdcCheckGrpcHealthResult') {
            dc_idc_1.DcIdcCheckGrpcHealthResult.encode(message.value.dcIdcCheckGrpcHealthResult, writer.uint32(34).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdcStartScreenRecordResult') {
            dc_idc_1.DcIdcStartScreenRecordResult.encode(message.value.dcIdcStartScreenRecordResult, writer.uint32(42).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdcStopScreenRecordResult') {
            dc_idc_1.DcIdcStopScreenRecordResult.encode(message.value.dcIdcStopScreenRecordResult, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdcResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.value = {
                        $case: 'dcIdcScanIdsResult',
                        dcIdcScanIdsResult: dc_idc_1.DcIdcScanIdsResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 3:
                    message.value = {
                        $case: 'dcIdcOpenGrpcClientResult',
                        dcIdcOpenGrpcClientResult: dc_idc_1.DcIdcOpenGrpcClientResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 4:
                    message.value = {
                        $case: 'dcIdcCheckGrpcHealthResult',
                        dcIdcCheckGrpcHealthResult: dc_idc_1.DcIdcCheckGrpcHealthResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 5:
                    message.value = {
                        $case: 'dcIdcStartScreenRecordResult',
                        dcIdcStartScreenRecordResult: dc_idc_1.DcIdcStartScreenRecordResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 6:
                    message.value = {
                        $case: 'dcIdcStopScreenRecordResult',
                        dcIdcStopScreenRecordResult: dc_idc_1.DcIdcStopScreenRecordResult.decode(reader, reader.uint32()),
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
            value: isSet(object.dcIdcScanIdsResult)
                ? { $case: 'dcIdcScanIdsResult', dcIdcScanIdsResult: dc_idc_1.DcIdcScanIdsResult.fromJSON(object.dcIdcScanIdsResult) }
                : isSet(object.dcIdcOpenGrpcClientResult)
                    ? {
                        $case: 'dcIdcOpenGrpcClientResult',
                        dcIdcOpenGrpcClientResult: dc_idc_1.DcIdcOpenGrpcClientResult.fromJSON(object.dcIdcOpenGrpcClientResult),
                    }
                    : isSet(object.dcIdcCheckGrpcHealthResult)
                        ? {
                            $case: 'dcIdcCheckGrpcHealthResult',
                            dcIdcCheckGrpcHealthResult: dc_idc_1.DcIdcCheckGrpcHealthResult.fromJSON(object.dcIdcCheckGrpcHealthResult),
                        }
                        : isSet(object.dcIdcStartScreenRecordResult)
                            ? {
                                $case: 'dcIdcStartScreenRecordResult',
                                dcIdcStartScreenRecordResult: dc_idc_1.DcIdcStartScreenRecordResult.fromJSON(object.dcIdcStartScreenRecordResult),
                            }
                            : isSet(object.dcIdcStopScreenRecordResult)
                                ? {
                                    $case: 'dcIdcStopScreenRecordResult',
                                    dcIdcStopScreenRecordResult: dc_idc_1.DcIdcStopScreenRecordResult.fromJSON(object.dcIdcStopScreenRecordResult),
                                }
                                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.value?.$case === 'dcIdcScanIdsResult' &&
            (obj.dcIdcScanIdsResult = message.value?.dcIdcScanIdsResult ? dc_idc_1.DcIdcScanIdsResult.toJSON(message.value?.dcIdcScanIdsResult) : undefined);
        message.value?.$case === 'dcIdcOpenGrpcClientResult' &&
            (obj.dcIdcOpenGrpcClientResult = message.value?.dcIdcOpenGrpcClientResult ? dc_idc_1.DcIdcOpenGrpcClientResult.toJSON(message.value?.dcIdcOpenGrpcClientResult) : undefined);
        message.value?.$case === 'dcIdcCheckGrpcHealthResult' &&
            (obj.dcIdcCheckGrpcHealthResult = message.value?.dcIdcCheckGrpcHealthResult ? dc_idc_1.DcIdcCheckGrpcHealthResult.toJSON(message.value?.dcIdcCheckGrpcHealthResult) : undefined);
        message.value?.$case === 'dcIdcStartScreenRecordResult' &&
            (obj.dcIdcStartScreenRecordResult = message.value?.dcIdcStartScreenRecordResult
                ? dc_idc_1.DcIdcStartScreenRecordResult.toJSON(message.value?.dcIdcStartScreenRecordResult)
                : undefined);
        message.value?.$case === 'dcIdcStopScreenRecordResult' &&
            (obj.dcIdcStopScreenRecordResult = message.value?.dcIdcStopScreenRecordResult ? dc_idc_1.DcIdcStopScreenRecordResult.toJSON(message.value?.dcIdcStopScreenRecordResult) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdcResult();
        if (object.value?.$case === 'dcIdcScanIdsResult' && object.value?.dcIdcScanIdsResult !== undefined && object.value?.dcIdcScanIdsResult !== null) {
            message.value = {
                $case: 'dcIdcScanIdsResult',
                dcIdcScanIdsResult: dc_idc_1.DcIdcScanIdsResult.fromPartial(object.value.dcIdcScanIdsResult),
            };
        }
        if (object.value?.$case === 'dcIdcOpenGrpcClientResult' && object.value?.dcIdcOpenGrpcClientResult !== undefined && object.value?.dcIdcOpenGrpcClientResult !== null) {
            message.value = {
                $case: 'dcIdcOpenGrpcClientResult',
                dcIdcOpenGrpcClientResult: dc_idc_1.DcIdcOpenGrpcClientResult.fromPartial(object.value.dcIdcOpenGrpcClientResult),
            };
        }
        if (object.value?.$case === 'dcIdcCheckGrpcHealthResult' && object.value?.dcIdcCheckGrpcHealthResult !== undefined && object.value?.dcIdcCheckGrpcHealthResult !== null) {
            message.value = {
                $case: 'dcIdcCheckGrpcHealthResult',
                dcIdcCheckGrpcHealthResult: dc_idc_1.DcIdcCheckGrpcHealthResult.fromPartial(object.value.dcIdcCheckGrpcHealthResult),
            };
        }
        if (object.value?.$case === 'dcIdcStartScreenRecordResult' && object.value?.dcIdcStartScreenRecordResult !== undefined && object.value?.dcIdcStartScreenRecordResult !== null) {
            message.value = {
                $case: 'dcIdcStartScreenRecordResult',
                dcIdcStartScreenRecordResult: dc_idc_1.DcIdcStartScreenRecordResult.fromPartial(object.value.dcIdcStartScreenRecordResult),
            };
        }
        if (object.value?.$case === 'dcIdcStopScreenRecordResult' && object.value?.dcIdcStopScreenRecordResult !== undefined && object.value?.dcIdcStopScreenRecordResult !== null) {
            message.value = {
                $case: 'dcIdcStopScreenRecordResult',
                dcIdcStopScreenRecordResult: dc_idc_1.DcIdcStopScreenRecordResult.fromPartial(object.value.dcIdcStopScreenRecordResult),
            };
        }
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
