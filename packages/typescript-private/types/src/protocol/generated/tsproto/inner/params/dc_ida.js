"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcIdaResultList = exports.DcIdaParamList = exports.DcIdaResult = exports.DcIdaParam = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const cf_gdc_da_1 = require("../types/cf_gdc_da");
const dc_ida_1 = require("../types/dc_ida");
function createBaseDcIdaParam() {
    return { seq: 0, value: undefined };
}
exports.DcIdaParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.seq !== 0) {
            writer.uint32(85).fixed32(message.seq);
        }
        if (message.value?.$case === 'dcIdaRunappParam') {
            dc_ida_1.DcIdaRunAppParam.encode(message.value.dcIdaRunappParam, writer.uint32(10).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdaGetSystemInfoParam') {
            dc_ida_1.DcIdaGetSystemInfoParam.encode(message.value.dcIdaGetSystemInfoParam, writer.uint32(18).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdaIsPortListeningParam') {
            dc_ida_1.DcIdaIsPortListeningParam.encode(message.value.dcIdaIsPortListeningParam, writer.uint32(26).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdaQueryProfileParam') {
            dc_ida_1.DcIdaQueryProfileParam.encode(message.value.dcIdaQueryProfileParam, writer.uint32(34).fork()).ldelim();
        }
        if (message.value?.$case === 'dcGdcDaControlParam') {
            cf_gdc_da_1.CfGdcDaControlParam.encode(message.value.dcGdcDaControlParam, writer.uint32(42).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdaSwitchInputBlockParam') {
            dc_ida_1.DcIdaSwitchInputBlockParam.encode(message.value.dcIdaSwitchInputBlockParam, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 10:
                    message.seq = reader.fixed32();
                    break;
                case 1:
                    message.value = {
                        $case: 'dcIdaRunappParam',
                        dcIdaRunappParam: dc_ida_1.DcIdaRunAppParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 2:
                    message.value = {
                        $case: 'dcIdaGetSystemInfoParam',
                        dcIdaGetSystemInfoParam: dc_ida_1.DcIdaGetSystemInfoParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 3:
                    message.value = {
                        $case: 'dcIdaIsPortListeningParam',
                        dcIdaIsPortListeningParam: dc_ida_1.DcIdaIsPortListeningParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 4:
                    message.value = {
                        $case: 'dcIdaQueryProfileParam',
                        dcIdaQueryProfileParam: dc_ida_1.DcIdaQueryProfileParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 5:
                    message.value = {
                        $case: 'dcGdcDaControlParam',
                        dcGdcDaControlParam: cf_gdc_da_1.CfGdcDaControlParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 6:
                    message.value = {
                        $case: 'dcIdaSwitchInputBlockParam',
                        dcIdaSwitchInputBlockParam: dc_ida_1.DcIdaSwitchInputBlockParam.decode(reader, reader.uint32()),
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
            seq: isSet(object.seq) ? Number(object.seq) : 0,
            value: isSet(object.dcIdaRunappParam)
                ? { $case: 'dcIdaRunappParam', dcIdaRunappParam: dc_ida_1.DcIdaRunAppParam.fromJSON(object.dcIdaRunappParam) }
                : isSet(object.dcIdaGetSystemInfoParam)
                    ? {
                        $case: 'dcIdaGetSystemInfoParam',
                        dcIdaGetSystemInfoParam: dc_ida_1.DcIdaGetSystemInfoParam.fromJSON(object.dcIdaGetSystemInfoParam),
                    }
                    : isSet(object.dcIdaIsPortListeningParam)
                        ? {
                            $case: 'dcIdaIsPortListeningParam',
                            dcIdaIsPortListeningParam: dc_ida_1.DcIdaIsPortListeningParam.fromJSON(object.dcIdaIsPortListeningParam),
                        }
                        : isSet(object.dcIdaQueryProfileParam)
                            ? {
                                $case: 'dcIdaQueryProfileParam',
                                dcIdaQueryProfileParam: dc_ida_1.DcIdaQueryProfileParam.fromJSON(object.dcIdaQueryProfileParam),
                            }
                            : isSet(object.dcGdcDaControlParam)
                                ? {
                                    $case: 'dcGdcDaControlParam',
                                    dcGdcDaControlParam: cf_gdc_da_1.CfGdcDaControlParam.fromJSON(object.dcGdcDaControlParam),
                                }
                                : isSet(object.dcIdaSwitchInputBlockParam)
                                    ? {
                                        $case: 'dcIdaSwitchInputBlockParam',
                                        dcIdaSwitchInputBlockParam: dc_ida_1.DcIdaSwitchInputBlockParam.fromJSON(object.dcIdaSwitchInputBlockParam),
                                    }
                                    : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.seq !== undefined && (obj.seq = Math.round(message.seq));
        message.value?.$case === 'dcIdaRunappParam' && (obj.dcIdaRunappParam = message.value?.dcIdaRunappParam ? dc_ida_1.DcIdaRunAppParam.toJSON(message.value?.dcIdaRunappParam) : undefined);
        message.value?.$case === 'dcIdaGetSystemInfoParam' &&
            (obj.dcIdaGetSystemInfoParam = message.value?.dcIdaGetSystemInfoParam ? dc_ida_1.DcIdaGetSystemInfoParam.toJSON(message.value?.dcIdaGetSystemInfoParam) : undefined);
        message.value?.$case === 'dcIdaIsPortListeningParam' &&
            (obj.dcIdaIsPortListeningParam = message.value?.dcIdaIsPortListeningParam ? dc_ida_1.DcIdaIsPortListeningParam.toJSON(message.value?.dcIdaIsPortListeningParam) : undefined);
        message.value?.$case === 'dcIdaQueryProfileParam' &&
            (obj.dcIdaQueryProfileParam = message.value?.dcIdaQueryProfileParam ? dc_ida_1.DcIdaQueryProfileParam.toJSON(message.value?.dcIdaQueryProfileParam) : undefined);
        message.value?.$case === 'dcGdcDaControlParam' &&
            (obj.dcGdcDaControlParam = message.value?.dcGdcDaControlParam ? cf_gdc_da_1.CfGdcDaControlParam.toJSON(message.value?.dcGdcDaControlParam) : undefined);
        message.value?.$case === 'dcIdaSwitchInputBlockParam' &&
            (obj.dcIdaSwitchInputBlockParam = message.value?.dcIdaSwitchInputBlockParam ? dc_ida_1.DcIdaSwitchInputBlockParam.toJSON(message.value?.dcIdaSwitchInputBlockParam) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdaParam();
        message.seq = object.seq ?? 0;
        if (object.value?.$case === 'dcIdaRunappParam' && object.value?.dcIdaRunappParam !== undefined && object.value?.dcIdaRunappParam !== null) {
            message.value = {
                $case: 'dcIdaRunappParam',
                dcIdaRunappParam: dc_ida_1.DcIdaRunAppParam.fromPartial(object.value.dcIdaRunappParam),
            };
        }
        if (object.value?.$case === 'dcIdaGetSystemInfoParam' && object.value?.dcIdaGetSystemInfoParam !== undefined && object.value?.dcIdaGetSystemInfoParam !== null) {
            message.value = {
                $case: 'dcIdaGetSystemInfoParam',
                dcIdaGetSystemInfoParam: dc_ida_1.DcIdaGetSystemInfoParam.fromPartial(object.value.dcIdaGetSystemInfoParam),
            };
        }
        if (object.value?.$case === 'dcIdaIsPortListeningParam' && object.value?.dcIdaIsPortListeningParam !== undefined && object.value?.dcIdaIsPortListeningParam !== null) {
            message.value = {
                $case: 'dcIdaIsPortListeningParam',
                dcIdaIsPortListeningParam: dc_ida_1.DcIdaIsPortListeningParam.fromPartial(object.value.dcIdaIsPortListeningParam),
            };
        }
        if (object.value?.$case === 'dcIdaQueryProfileParam' && object.value?.dcIdaQueryProfileParam !== undefined && object.value?.dcIdaQueryProfileParam !== null) {
            message.value = {
                $case: 'dcIdaQueryProfileParam',
                dcIdaQueryProfileParam: dc_ida_1.DcIdaQueryProfileParam.fromPartial(object.value.dcIdaQueryProfileParam),
            };
        }
        if (object.value?.$case === 'dcGdcDaControlParam' && object.value?.dcGdcDaControlParam !== undefined && object.value?.dcGdcDaControlParam !== null) {
            message.value = {
                $case: 'dcGdcDaControlParam',
                dcGdcDaControlParam: cf_gdc_da_1.CfGdcDaControlParam.fromPartial(object.value.dcGdcDaControlParam),
            };
        }
        if (object.value?.$case === 'dcIdaSwitchInputBlockParam' && object.value?.dcIdaSwitchInputBlockParam !== undefined && object.value?.dcIdaSwitchInputBlockParam !== null) {
            message.value = {
                $case: 'dcIdaSwitchInputBlockParam',
                dcIdaSwitchInputBlockParam: dc_ida_1.DcIdaSwitchInputBlockParam.fromPartial(object.value.dcIdaSwitchInputBlockParam),
            };
        }
        return message;
    },
};
function createBaseDcIdaResult() {
    return { seq: 0, value: undefined };
}
exports.DcIdaResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.seq !== 0) {
            writer.uint32(85).fixed32(message.seq);
        }
        if (message.value?.$case === 'dcIdaRunappResult') {
            dc_ida_1.DcIdaRunAppResult.encode(message.value.dcIdaRunappResult, writer.uint32(10).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdaGetSystemInfoResult') {
            dc_ida_1.DcIdaGetSystemInfoResult.encode(message.value.dcIdaGetSystemInfoResult, writer.uint32(18).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdaIsPortListeningResult') {
            dc_ida_1.DcIdaIsPortListeningResult.encode(message.value.dcIdaIsPortListeningResult, writer.uint32(26).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdaQueryProfileResult') {
            dc_ida_1.DcIdaQueryProfileResult.encode(message.value.dcIdaQueryProfileResult, writer.uint32(34).fork()).ldelim();
        }
        if (message.value?.$case === 'dcGdcDaControlResult') {
            cf_gdc_da_1.CfGdcDaControlResult.encode(message.value.dcGdcDaControlResult, writer.uint32(42).fork()).ldelim();
        }
        if (message.value?.$case === 'dcIdaSwitchInputBlockResult') {
            dc_ida_1.DcIdaSwitchInputBlockResult.encode(message.value.dcIdaSwitchInputBlockResult, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 10:
                    message.seq = reader.fixed32();
                    break;
                case 1:
                    message.value = {
                        $case: 'dcIdaRunappResult',
                        dcIdaRunappResult: dc_ida_1.DcIdaRunAppResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 2:
                    message.value = {
                        $case: 'dcIdaGetSystemInfoResult',
                        dcIdaGetSystemInfoResult: dc_ida_1.DcIdaGetSystemInfoResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 3:
                    message.value = {
                        $case: 'dcIdaIsPortListeningResult',
                        dcIdaIsPortListeningResult: dc_ida_1.DcIdaIsPortListeningResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 4:
                    message.value = {
                        $case: 'dcIdaQueryProfileResult',
                        dcIdaQueryProfileResult: dc_ida_1.DcIdaQueryProfileResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 5:
                    message.value = {
                        $case: 'dcGdcDaControlResult',
                        dcGdcDaControlResult: cf_gdc_da_1.CfGdcDaControlResult.decode(reader, reader.uint32()),
                    };
                    break;
                case 6:
                    message.value = {
                        $case: 'dcIdaSwitchInputBlockResult',
                        dcIdaSwitchInputBlockResult: dc_ida_1.DcIdaSwitchInputBlockResult.decode(reader, reader.uint32()),
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
            seq: isSet(object.seq) ? Number(object.seq) : 0,
            value: isSet(object.dcIdaRunappResult)
                ? { $case: 'dcIdaRunappResult', dcIdaRunappResult: dc_ida_1.DcIdaRunAppResult.fromJSON(object.dcIdaRunappResult) }
                : isSet(object.dcIdaGetSystemInfoResult)
                    ? {
                        $case: 'dcIdaGetSystemInfoResult',
                        dcIdaGetSystemInfoResult: dc_ida_1.DcIdaGetSystemInfoResult.fromJSON(object.dcIdaGetSystemInfoResult),
                    }
                    : isSet(object.dcIdaIsPortListeningResult)
                        ? {
                            $case: 'dcIdaIsPortListeningResult',
                            dcIdaIsPortListeningResult: dc_ida_1.DcIdaIsPortListeningResult.fromJSON(object.dcIdaIsPortListeningResult),
                        }
                        : isSet(object.dcIdaQueryProfileResult)
                            ? {
                                $case: 'dcIdaQueryProfileResult',
                                dcIdaQueryProfileResult: dc_ida_1.DcIdaQueryProfileResult.fromJSON(object.dcIdaQueryProfileResult),
                            }
                            : isSet(object.dcGdcDaControlResult)
                                ? {
                                    $case: 'dcGdcDaControlResult',
                                    dcGdcDaControlResult: cf_gdc_da_1.CfGdcDaControlResult.fromJSON(object.dcGdcDaControlResult),
                                }
                                : isSet(object.dcIdaSwitchInputBlockResult)
                                    ? {
                                        $case: 'dcIdaSwitchInputBlockResult',
                                        dcIdaSwitchInputBlockResult: dc_ida_1.DcIdaSwitchInputBlockResult.fromJSON(object.dcIdaSwitchInputBlockResult),
                                    }
                                    : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.seq !== undefined && (obj.seq = Math.round(message.seq));
        message.value?.$case === 'dcIdaRunappResult' &&
            (obj.dcIdaRunappResult = message.value?.dcIdaRunappResult ? dc_ida_1.DcIdaRunAppResult.toJSON(message.value?.dcIdaRunappResult) : undefined);
        message.value?.$case === 'dcIdaGetSystemInfoResult' &&
            (obj.dcIdaGetSystemInfoResult = message.value?.dcIdaGetSystemInfoResult ? dc_ida_1.DcIdaGetSystemInfoResult.toJSON(message.value?.dcIdaGetSystemInfoResult) : undefined);
        message.value?.$case === 'dcIdaIsPortListeningResult' &&
            (obj.dcIdaIsPortListeningResult = message.value?.dcIdaIsPortListeningResult ? dc_ida_1.DcIdaIsPortListeningResult.toJSON(message.value?.dcIdaIsPortListeningResult) : undefined);
        message.value?.$case === 'dcIdaQueryProfileResult' &&
            (obj.dcIdaQueryProfileResult = message.value?.dcIdaQueryProfileResult ? dc_ida_1.DcIdaQueryProfileResult.toJSON(message.value?.dcIdaQueryProfileResult) : undefined);
        message.value?.$case === 'dcGdcDaControlResult' &&
            (obj.dcGdcDaControlResult = message.value?.dcGdcDaControlResult ? cf_gdc_da_1.CfGdcDaControlResult.toJSON(message.value?.dcGdcDaControlResult) : undefined);
        message.value?.$case === 'dcIdaSwitchInputBlockResult' &&
            (obj.dcIdaSwitchInputBlockResult = message.value?.dcIdaSwitchInputBlockResult ? dc_ida_1.DcIdaSwitchInputBlockResult.toJSON(message.value?.dcIdaSwitchInputBlockResult) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdaResult();
        message.seq = object.seq ?? 0;
        if (object.value?.$case === 'dcIdaRunappResult' && object.value?.dcIdaRunappResult !== undefined && object.value?.dcIdaRunappResult !== null) {
            message.value = {
                $case: 'dcIdaRunappResult',
                dcIdaRunappResult: dc_ida_1.DcIdaRunAppResult.fromPartial(object.value.dcIdaRunappResult),
            };
        }
        if (object.value?.$case === 'dcIdaGetSystemInfoResult' && object.value?.dcIdaGetSystemInfoResult !== undefined && object.value?.dcIdaGetSystemInfoResult !== null) {
            message.value = {
                $case: 'dcIdaGetSystemInfoResult',
                dcIdaGetSystemInfoResult: dc_ida_1.DcIdaGetSystemInfoResult.fromPartial(object.value.dcIdaGetSystemInfoResult),
            };
        }
        if (object.value?.$case === 'dcIdaIsPortListeningResult' && object.value?.dcIdaIsPortListeningResult !== undefined && object.value?.dcIdaIsPortListeningResult !== null) {
            message.value = {
                $case: 'dcIdaIsPortListeningResult',
                dcIdaIsPortListeningResult: dc_ida_1.DcIdaIsPortListeningResult.fromPartial(object.value.dcIdaIsPortListeningResult),
            };
        }
        if (object.value?.$case === 'dcIdaQueryProfileResult' && object.value?.dcIdaQueryProfileResult !== undefined && object.value?.dcIdaQueryProfileResult !== null) {
            message.value = {
                $case: 'dcIdaQueryProfileResult',
                dcIdaQueryProfileResult: dc_ida_1.DcIdaQueryProfileResult.fromPartial(object.value.dcIdaQueryProfileResult),
            };
        }
        if (object.value?.$case === 'dcGdcDaControlResult' && object.value?.dcGdcDaControlResult !== undefined && object.value?.dcGdcDaControlResult !== null) {
            message.value = {
                $case: 'dcGdcDaControlResult',
                dcGdcDaControlResult: cf_gdc_da_1.CfGdcDaControlResult.fromPartial(object.value.dcGdcDaControlResult),
            };
        }
        if (object.value?.$case === 'dcIdaSwitchInputBlockResult' && object.value?.dcIdaSwitchInputBlockResult !== undefined && object.value?.dcIdaSwitchInputBlockResult !== null) {
            message.value = {
                $case: 'dcIdaSwitchInputBlockResult',
                dcIdaSwitchInputBlockResult: dc_ida_1.DcIdaSwitchInputBlockResult.fromPartial(object.value.dcIdaSwitchInputBlockResult),
            };
        }
        return message;
    },
};
function createBaseDcIdaParamList() {
    return { params: [] };
}
exports.DcIdaParamList = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.params) {
            exports.DcIdaParam.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaParamList();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.params.push(exports.DcIdaParam.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { params: Array.isArray(object?.params) ? object.params.map((e) => exports.DcIdaParam.fromJSON(e)) : [] };
    },
    toJSON(message) {
        const obj = {};
        if (message.params) {
            obj.params = message.params.map((e) => (e ? exports.DcIdaParam.toJSON(e) : undefined));
        }
        else {
            obj.params = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdaParamList();
        message.params = object.params?.map((e) => exports.DcIdaParam.fromPartial(e)) || [];
        return message;
    },
};
function createBaseDcIdaResultList() {
    return { results: [] };
}
exports.DcIdaResultList = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.results) {
            exports.DcIdaResult.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcIdaResultList();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.results.push(exports.DcIdaResult.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { results: Array.isArray(object?.results) ? object.results.map((e) => exports.DcIdaResult.fromJSON(e)) : [] };
    },
    toJSON(message) {
        const obj = {};
        if (message.results) {
            obj.results = message.results.map((e) => (e ? exports.DcIdaResult.toJSON(e) : undefined));
        }
        else {
            obj.results = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcIdaResultList();
        message.results = object.results?.map((e) => exports.DcIdaResult.fromPartial(e)) || [];
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
