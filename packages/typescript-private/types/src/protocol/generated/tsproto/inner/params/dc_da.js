"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DcDaReturn = exports.DcDaParam = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const dc_da_1 = require("../types/dc_da");
function createBaseDcDaParam() {
    return { seq: 0, value: undefined };
}
exports.DcDaParam = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.seq !== 0) {
            writer.uint32(13).fixed32(message.seq);
        }
        if (message.value?.$case === 'dcDaConnectionParam') {
            dc_da_1.DcDaConnectionParam.encode(message.value.dcDaConnectionParam, writer.uint32(18).fork()).ldelim();
        }
        if (message.value?.$case === 'dcDaQueryProfileParam') {
            dc_da_1.DcDaQueryProfileParam.encode(message.value.dcDaQueryProfileParam, writer.uint32(26).fork()).ldelim();
        }
        if (message.value?.$case === 'dcDaApplyStreamingOptionParam') {
            dc_da_1.DcDaApplyStreamingOptionParam.encode(message.value.dcDaApplyStreamingOptionParam, writer.uint32(34).fork()).ldelim();
        }
        if (message.value?.$case === 'dcDaControlParam') {
            dc_da_1.DcDaControlParam.encode(message.value.dcDaControlParam, writer.uint32(42).fork()).ldelim();
        }
        if (message.value?.$case === 'dcDaGetFoldableStateParam') {
            dc_da_1.DcDaGetFoldableStateParam.encode(message.value.dcDaGetFoldableStateParam, writer.uint32(50).fork()).ldelim();
        }
        if (message.value?.$case === 'dcDaSetFoldableStateParam') {
            dc_da_1.DcDaSetFoldableStateParam.encode(message.value.dcDaSetFoldableStateParam, writer.uint32(58).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaParam();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.seq = reader.fixed32();
                    break;
                case 2:
                    message.value = {
                        $case: 'dcDaConnectionParam',
                        dcDaConnectionParam: dc_da_1.DcDaConnectionParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 3:
                    message.value = {
                        $case: 'dcDaQueryProfileParam',
                        dcDaQueryProfileParam: dc_da_1.DcDaQueryProfileParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 4:
                    message.value = {
                        $case: 'dcDaApplyStreamingOptionParam',
                        dcDaApplyStreamingOptionParam: dc_da_1.DcDaApplyStreamingOptionParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 5:
                    message.value = {
                        $case: 'dcDaControlParam',
                        dcDaControlParam: dc_da_1.DcDaControlParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 6:
                    message.value = {
                        $case: 'dcDaGetFoldableStateParam',
                        dcDaGetFoldableStateParam: dc_da_1.DcDaGetFoldableStateParam.decode(reader, reader.uint32()),
                    };
                    break;
                case 7:
                    message.value = {
                        $case: 'dcDaSetFoldableStateParam',
                        dcDaSetFoldableStateParam: dc_da_1.DcDaSetFoldableStateParam.decode(reader, reader.uint32()),
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
            value: isSet(object.dcDaConnectionParam)
                ? {
                    $case: 'dcDaConnectionParam',
                    dcDaConnectionParam: dc_da_1.DcDaConnectionParam.fromJSON(object.dcDaConnectionParam),
                }
                : isSet(object.dcDaQueryProfileParam)
                    ? {
                        $case: 'dcDaQueryProfileParam',
                        dcDaQueryProfileParam: dc_da_1.DcDaQueryProfileParam.fromJSON(object.dcDaQueryProfileParam),
                    }
                    : isSet(object.dcDaApplyStreamingOptionParam)
                        ? {
                            $case: 'dcDaApplyStreamingOptionParam',
                            dcDaApplyStreamingOptionParam: dc_da_1.DcDaApplyStreamingOptionParam.fromJSON(object.dcDaApplyStreamingOptionParam),
                        }
                        : isSet(object.dcDaControlParam)
                            ? { $case: 'dcDaControlParam', dcDaControlParam: dc_da_1.DcDaControlParam.fromJSON(object.dcDaControlParam) }
                            : isSet(object.dcDaGetFoldableStateParam)
                                ? {
                                    $case: 'dcDaGetFoldableStateParam',
                                    dcDaGetFoldableStateParam: dc_da_1.DcDaGetFoldableStateParam.fromJSON(object.dcDaGetFoldableStateParam),
                                }
                                : isSet(object.dcDaSetFoldableStateParam)
                                    ? {
                                        $case: 'dcDaSetFoldableStateParam',
                                        dcDaSetFoldableStateParam: dc_da_1.DcDaSetFoldableStateParam.fromJSON(object.dcDaSetFoldableStateParam),
                                    }
                                    : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.seq !== undefined && (obj.seq = Math.round(message.seq));
        message.value?.$case === 'dcDaConnectionParam' &&
            (obj.dcDaConnectionParam = message.value?.dcDaConnectionParam ? dc_da_1.DcDaConnectionParam.toJSON(message.value?.dcDaConnectionParam) : undefined);
        message.value?.$case === 'dcDaQueryProfileParam' &&
            (obj.dcDaQueryProfileParam = message.value?.dcDaQueryProfileParam ? dc_da_1.DcDaQueryProfileParam.toJSON(message.value?.dcDaQueryProfileParam) : undefined);
        message.value?.$case === 'dcDaApplyStreamingOptionParam' &&
            (obj.dcDaApplyStreamingOptionParam = message.value?.dcDaApplyStreamingOptionParam
                ? dc_da_1.DcDaApplyStreamingOptionParam.toJSON(message.value?.dcDaApplyStreamingOptionParam)
                : undefined);
        message.value?.$case === 'dcDaControlParam' && (obj.dcDaControlParam = message.value?.dcDaControlParam ? dc_da_1.DcDaControlParam.toJSON(message.value?.dcDaControlParam) : undefined);
        message.value?.$case === 'dcDaGetFoldableStateParam' &&
            (obj.dcDaGetFoldableStateParam = message.value?.dcDaGetFoldableStateParam ? dc_da_1.DcDaGetFoldableStateParam.toJSON(message.value?.dcDaGetFoldableStateParam) : undefined);
        message.value?.$case === 'dcDaSetFoldableStateParam' &&
            (obj.dcDaSetFoldableStateParam = message.value?.dcDaSetFoldableStateParam ? dc_da_1.DcDaSetFoldableStateParam.toJSON(message.value?.dcDaSetFoldableStateParam) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcDaParam();
        message.seq = object.seq ?? 0;
        if (object.value?.$case === 'dcDaConnectionParam' && object.value?.dcDaConnectionParam !== undefined && object.value?.dcDaConnectionParam !== null) {
            message.value = {
                $case: 'dcDaConnectionParam',
                dcDaConnectionParam: dc_da_1.DcDaConnectionParam.fromPartial(object.value.dcDaConnectionParam),
            };
        }
        if (object.value?.$case === 'dcDaQueryProfileParam' && object.value?.dcDaQueryProfileParam !== undefined && object.value?.dcDaQueryProfileParam !== null) {
            message.value = {
                $case: 'dcDaQueryProfileParam',
                dcDaQueryProfileParam: dc_da_1.DcDaQueryProfileParam.fromPartial(object.value.dcDaQueryProfileParam),
            };
        }
        if (object.value?.$case === 'dcDaApplyStreamingOptionParam' &&
            object.value?.dcDaApplyStreamingOptionParam !== undefined &&
            object.value?.dcDaApplyStreamingOptionParam !== null) {
            message.value = {
                $case: 'dcDaApplyStreamingOptionParam',
                dcDaApplyStreamingOptionParam: dc_da_1.DcDaApplyStreamingOptionParam.fromPartial(object.value.dcDaApplyStreamingOptionParam),
            };
        }
        if (object.value?.$case === 'dcDaControlParam' && object.value?.dcDaControlParam !== undefined && object.value?.dcDaControlParam !== null) {
            message.value = {
                $case: 'dcDaControlParam',
                dcDaControlParam: dc_da_1.DcDaControlParam.fromPartial(object.value.dcDaControlParam),
            };
        }
        if (object.value?.$case === 'dcDaGetFoldableStateParam' && object.value?.dcDaGetFoldableStateParam !== undefined && object.value?.dcDaGetFoldableStateParam !== null) {
            message.value = {
                $case: 'dcDaGetFoldableStateParam',
                dcDaGetFoldableStateParam: dc_da_1.DcDaGetFoldableStateParam.fromPartial(object.value.dcDaGetFoldableStateParam),
            };
        }
        if (object.value?.$case === 'dcDaSetFoldableStateParam' && object.value?.dcDaSetFoldableStateParam !== undefined && object.value?.dcDaSetFoldableStateParam !== null) {
            message.value = {
                $case: 'dcDaSetFoldableStateParam',
                dcDaSetFoldableStateParam: dc_da_1.DcDaSetFoldableStateParam.fromPartial(object.value.dcDaSetFoldableStateParam),
            };
        }
        return message;
    },
};
function createBaseDcDaReturn() {
    return { seq: 0, value: undefined };
}
exports.DcDaReturn = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.seq !== 0) {
            writer.uint32(13).fixed32(message.seq);
        }
        if (message.value?.$case === 'dcDaConnectionReturn') {
            dc_da_1.DcDaConnectionReturn.encode(message.value.dcDaConnectionReturn, writer.uint32(18).fork()).ldelim();
        }
        if (message.value?.$case === 'dcDaQueryProfileReturn') {
            dc_da_1.DcDaQueryProfileReturn.encode(message.value.dcDaQueryProfileReturn, writer.uint32(26).fork()).ldelim();
        }
        if (message.value?.$case === 'dcDaApplyStreamingOptionReturn') {
            dc_da_1.DcDaApplyStreamingOptionReturn.encode(message.value.dcDaApplyStreamingOptionReturn, writer.uint32(34).fork()).ldelim();
        }
        if (message.value?.$case === 'dcDaControlReturn') {
            dc_da_1.DcDaControlReturn.encode(message.value.dcDaControlReturn, writer.uint32(42).fork()).ldelim();
        }
        if (message.value?.$case === 'dcDaGetFoldableStateReturn') {
            dc_da_1.DcDaGetFoldableStateReturn.encode(message.value.dcDaGetFoldableStateReturn, writer.uint32(50).fork()).ldelim();
        }
        if (message.value?.$case === 'dcDaSetFoldableStateReturn') {
            dc_da_1.DcDaSetFoldableStateReturn.encode(message.value.dcDaSetFoldableStateReturn, writer.uint32(58).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseDcDaReturn();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.seq = reader.fixed32();
                    break;
                case 2:
                    message.value = {
                        $case: 'dcDaConnectionReturn',
                        dcDaConnectionReturn: dc_da_1.DcDaConnectionReturn.decode(reader, reader.uint32()),
                    };
                    break;
                case 3:
                    message.value = {
                        $case: 'dcDaQueryProfileReturn',
                        dcDaQueryProfileReturn: dc_da_1.DcDaQueryProfileReturn.decode(reader, reader.uint32()),
                    };
                    break;
                case 4:
                    message.value = {
                        $case: 'dcDaApplyStreamingOptionReturn',
                        dcDaApplyStreamingOptionReturn: dc_da_1.DcDaApplyStreamingOptionReturn.decode(reader, reader.uint32()),
                    };
                    break;
                case 5:
                    message.value = {
                        $case: 'dcDaControlReturn',
                        dcDaControlReturn: dc_da_1.DcDaControlReturn.decode(reader, reader.uint32()),
                    };
                    break;
                case 6:
                    message.value = {
                        $case: 'dcDaGetFoldableStateReturn',
                        dcDaGetFoldableStateReturn: dc_da_1.DcDaGetFoldableStateReturn.decode(reader, reader.uint32()),
                    };
                    break;
                case 7:
                    message.value = {
                        $case: 'dcDaSetFoldableStateReturn',
                        dcDaSetFoldableStateReturn: dc_da_1.DcDaSetFoldableStateReturn.decode(reader, reader.uint32()),
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
            value: isSet(object.dcDaConnectionReturn)
                ? {
                    $case: 'dcDaConnectionReturn',
                    dcDaConnectionReturn: dc_da_1.DcDaConnectionReturn.fromJSON(object.dcDaConnectionReturn),
                }
                : isSet(object.dcDaQueryProfileReturn)
                    ? {
                        $case: 'dcDaQueryProfileReturn',
                        dcDaQueryProfileReturn: dc_da_1.DcDaQueryProfileReturn.fromJSON(object.dcDaQueryProfileReturn),
                    }
                    : isSet(object.dcDaApplyStreamingOptionReturn)
                        ? {
                            $case: 'dcDaApplyStreamingOptionReturn',
                            dcDaApplyStreamingOptionReturn: dc_da_1.DcDaApplyStreamingOptionReturn.fromJSON(object.dcDaApplyStreamingOptionReturn),
                        }
                        : isSet(object.dcDaControlReturn)
                            ? { $case: 'dcDaControlReturn', dcDaControlReturn: dc_da_1.DcDaControlReturn.fromJSON(object.dcDaControlReturn) }
                            : isSet(object.dcDaGetFoldableStateReturn)
                                ? {
                                    $case: 'dcDaGetFoldableStateReturn',
                                    dcDaGetFoldableStateReturn: dc_da_1.DcDaGetFoldableStateReturn.fromJSON(object.dcDaGetFoldableStateReturn),
                                }
                                : isSet(object.dcDaSetFoldableStateReturn)
                                    ? {
                                        $case: 'dcDaSetFoldableStateReturn',
                                        dcDaSetFoldableStateReturn: dc_da_1.DcDaSetFoldableStateReturn.fromJSON(object.dcDaSetFoldableStateReturn),
                                    }
                                    : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.seq !== undefined && (obj.seq = Math.round(message.seq));
        message.value?.$case === 'dcDaConnectionReturn' &&
            (obj.dcDaConnectionReturn = message.value?.dcDaConnectionReturn ? dc_da_1.DcDaConnectionReturn.toJSON(message.value?.dcDaConnectionReturn) : undefined);
        message.value?.$case === 'dcDaQueryProfileReturn' &&
            (obj.dcDaQueryProfileReturn = message.value?.dcDaQueryProfileReturn ? dc_da_1.DcDaQueryProfileReturn.toJSON(message.value?.dcDaQueryProfileReturn) : undefined);
        message.value?.$case === 'dcDaApplyStreamingOptionReturn' &&
            (obj.dcDaApplyStreamingOptionReturn = message.value?.dcDaApplyStreamingOptionReturn
                ? dc_da_1.DcDaApplyStreamingOptionReturn.toJSON(message.value?.dcDaApplyStreamingOptionReturn)
                : undefined);
        message.value?.$case === 'dcDaControlReturn' &&
            (obj.dcDaControlReturn = message.value?.dcDaControlReturn ? dc_da_1.DcDaControlReturn.toJSON(message.value?.dcDaControlReturn) : undefined);
        message.value?.$case === 'dcDaGetFoldableStateReturn' &&
            (obj.dcDaGetFoldableStateReturn = message.value?.dcDaGetFoldableStateReturn ? dc_da_1.DcDaGetFoldableStateReturn.toJSON(message.value?.dcDaGetFoldableStateReturn) : undefined);
        message.value?.$case === 'dcDaSetFoldableStateReturn' &&
            (obj.dcDaSetFoldableStateReturn = message.value?.dcDaSetFoldableStateReturn ? dc_da_1.DcDaSetFoldableStateReturn.toJSON(message.value?.dcDaSetFoldableStateReturn) : undefined);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseDcDaReturn();
        message.seq = object.seq ?? 0;
        if (object.value?.$case === 'dcDaConnectionReturn' && object.value?.dcDaConnectionReturn !== undefined && object.value?.dcDaConnectionReturn !== null) {
            message.value = {
                $case: 'dcDaConnectionReturn',
                dcDaConnectionReturn: dc_da_1.DcDaConnectionReturn.fromPartial(object.value.dcDaConnectionReturn),
            };
        }
        if (object.value?.$case === 'dcDaQueryProfileReturn' && object.value?.dcDaQueryProfileReturn !== undefined && object.value?.dcDaQueryProfileReturn !== null) {
            message.value = {
                $case: 'dcDaQueryProfileReturn',
                dcDaQueryProfileReturn: dc_da_1.DcDaQueryProfileReturn.fromPartial(object.value.dcDaQueryProfileReturn),
            };
        }
        if (object.value?.$case === 'dcDaApplyStreamingOptionReturn' &&
            object.value?.dcDaApplyStreamingOptionReturn !== undefined &&
            object.value?.dcDaApplyStreamingOptionReturn !== null) {
            message.value = {
                $case: 'dcDaApplyStreamingOptionReturn',
                dcDaApplyStreamingOptionReturn: dc_da_1.DcDaApplyStreamingOptionReturn.fromPartial(object.value.dcDaApplyStreamingOptionReturn),
            };
        }
        if (object.value?.$case === 'dcDaControlReturn' && object.value?.dcDaControlReturn !== undefined && object.value?.dcDaControlReturn !== null) {
            message.value = {
                $case: 'dcDaControlReturn',
                dcDaControlReturn: dc_da_1.DcDaControlReturn.fromPartial(object.value.dcDaControlReturn),
            };
        }
        if (object.value?.$case === 'dcDaGetFoldableStateReturn' && object.value?.dcDaGetFoldableStateReturn !== undefined && object.value?.dcDaGetFoldableStateReturn !== null) {
            message.value = {
                $case: 'dcDaGetFoldableStateReturn',
                dcDaGetFoldableStateReturn: dc_da_1.DcDaGetFoldableStateReturn.fromPartial(object.value.dcDaGetFoldableStateReturn),
            };
        }
        if (object.value?.$case === 'dcDaSetFoldableStateReturn' && object.value?.dcDaSetFoldableStateReturn !== undefined && object.value?.dcDaSetFoldableStateReturn !== null) {
            message.value = {
                $case: 'dcDaSetFoldableStateReturn',
                dcDaSetFoldableStateReturn: dc_da_1.DcDaSetFoldableStateReturn.fromPartial(object.value.dcDaSetFoldableStateReturn),
            };
        }
        return message;
    },
};
function isSet(value) {
    return value !== null && value !== undefined;
}
