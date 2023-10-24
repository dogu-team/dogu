"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CfGdcDaResultList = exports.CfGdcDaParamList = exports.CfGdcDaResult = exports.CfGdcDaParam = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const cf_gdc_da_1 = require("../types/cf_gdc_da");
function createBaseCfGdcDaParam() {
    return { seq: 0, serial: '', value: undefined };
}
exports.CfGdcDaParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.seq !== 0) {
            writer.uint32(13).fixed32(message.seq);
        }
        if (message.serial !== '') {
            writer.uint32(18).string(message.serial);
        }
        if (message.value?.$case === 'cfGdcDaControlParam') {
            cf_gdc_da_1.CfGdcDaControlParam.encode(message.value.cfGdcDaControlParam, writer.uint32(82).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCfGdcDaParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.seq = reader.fixed32();
                    break;
                case 2:
                    message.serial = reader.string();
                    break;
                case 10:
                    message.value = {
                        $case: 'cfGdcDaControlParam',
                        cfGdcDaControlParam: cf_gdc_da_1.CfGdcDaControlParam.decode(reader, reader.uint32()),
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
            serial: isSet(object.serial) ? String(object.serial) : '',
            value: isSet(object.cfGdcDaControlParam)
                ? {
                    $case: 'cfGdcDaControlParam',
                    cfGdcDaControlParam: cf_gdc_da_1.CfGdcDaControlParam.fromJSON(object.cfGdcDaControlParam),
                }
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.seq !== undefined && (obj.seq = Math.round(message.seq));
        message.serial !== undefined && (obj.serial = message.serial);
        message.value?.$case === 'cfGdcDaControlParam' &&
            (obj.cfGdcDaControlParam = message.value?.cfGdcDaControlParam ? cf_gdc_da_1.CfGdcDaControlParam.toJSON(message.value?.cfGdcDaControlParam) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCfGdcDaParam();
        message.seq = object.seq ?? 0;
        message.serial = object.serial ?? '';
        if (object.value?.$case === 'cfGdcDaControlParam' && object.value?.cfGdcDaControlParam !== undefined && object.value?.cfGdcDaControlParam !== null) {
            message.value = {
                $case: 'cfGdcDaControlParam',
                cfGdcDaControlParam: cf_gdc_da_1.CfGdcDaControlParam.fromPartial(object.value.cfGdcDaControlParam),
            };
        }
        return message;
    },
};
function createBaseCfGdcDaResult() {
    return { seq: 0, value: undefined };
}
exports.CfGdcDaResult = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.seq !== 0) {
            writer.uint32(13).fixed32(message.seq);
        }
        if (message.value?.$case === 'cfGdcDaControlResult') {
            cf_gdc_da_1.CfGdcDaControlResult.encode(message.value.cfGdcDaControlResult, writer.uint32(82).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCfGdcDaResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.seq = reader.fixed32();
                    break;
                case 10:
                    message.value = {
                        $case: 'cfGdcDaControlResult',
                        cfGdcDaControlResult: cf_gdc_da_1.CfGdcDaControlResult.decode(reader, reader.uint32()),
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
            value: isSet(object.cfGdcDaControlResult)
                ? {
                    $case: 'cfGdcDaControlResult',
                    cfGdcDaControlResult: cf_gdc_da_1.CfGdcDaControlResult.fromJSON(object.cfGdcDaControlResult),
                }
                : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.seq !== undefined && (obj.seq = Math.round(message.seq));
        message.value?.$case === 'cfGdcDaControlResult' &&
            (obj.cfGdcDaControlResult = message.value?.cfGdcDaControlResult ? cf_gdc_da_1.CfGdcDaControlResult.toJSON(message.value?.cfGdcDaControlResult) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCfGdcDaResult();
        message.seq = object.seq ?? 0;
        if (object.value?.$case === 'cfGdcDaControlResult' && object.value?.cfGdcDaControlResult !== undefined && object.value?.cfGdcDaControlResult !== null) {
            message.value = {
                $case: 'cfGdcDaControlResult',
                cfGdcDaControlResult: cf_gdc_da_1.CfGdcDaControlResult.fromPartial(object.value.cfGdcDaControlResult),
            };
        }
        return message;
    },
};
function createBaseCfGdcDaParamList() {
    return { params: [] };
}
exports.CfGdcDaParamList = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.params) {
            exports.CfGdcDaParam.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCfGdcDaParamList();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.params.push(exports.CfGdcDaParam.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { params: Array.isArray(object?.params) ? object.params.map((e) => exports.CfGdcDaParam.fromJSON(e)) : [] };
    },
    toJSON(message) {
        const obj = {};
        if (message.params) {
            obj.params = message.params.map((e) => (e ? exports.CfGdcDaParam.toJSON(e) : undefined));
        }
        else {
            obj.params = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCfGdcDaParamList();
        message.params = object.params?.map((e) => exports.CfGdcDaParam.fromPartial(e)) || [];
        return message;
    },
};
function createBaseCfGdcDaResultList() {
    return { results: [] };
}
exports.CfGdcDaResultList = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.results) {
            exports.CfGdcDaResult.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseCfGdcDaResultList();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.results.push(exports.CfGdcDaResult.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { results: Array.isArray(object?.results) ? object.results.map((e) => exports.CfGdcDaResult.fromJSON(e)) : [] };
    },
    toJSON(message) {
        const obj = {};
        if (message.results) {
            obj.results = message.results.map((e) => (e ? exports.CfGdcDaResult.toJSON(e) : undefined));
        }
        else {
            obj.results = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseCfGdcDaResultList();
        message.results = object.results?.map((e) => exports.CfGdcDaResult.fromPartial(e)) || [];
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
