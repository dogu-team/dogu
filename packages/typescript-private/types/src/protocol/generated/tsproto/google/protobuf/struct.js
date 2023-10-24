"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListValue = exports.Value = exports.Struct_FieldsEntry = exports.Struct = exports.nullValueToJSON = exports.nullValueFromJSON = exports.NullValue = void 0;
/* eslint-disable */
const minimal_1 = __importDefault(require("protobufjs/minimal"));
/**
 * `NullValue` is a singleton enumeration to represent the null value for the
 * `Value` type union.
 *
 *  The JSON representation for `NullValue` is JSON `null`.
 */
var NullValue;
(function (NullValue) {
    /** NULL_VALUE - Null value. */
    NullValue[NullValue["NULL_VALUE"] = 0] = "NULL_VALUE";
    NullValue[NullValue["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(NullValue = exports.NullValue || (exports.NullValue = {}));
function nullValueFromJSON(object) {
    switch (object) {
        case 0:
        case 'NULL_VALUE':
            return NullValue.NULL_VALUE;
        case -1:
        case 'UNRECOGNIZED':
        default:
            return NullValue.UNRECOGNIZED;
    }
}
exports.nullValueFromJSON = nullValueFromJSON;
function nullValueToJSON(object) {
    switch (object) {
        case NullValue.NULL_VALUE:
            return 'NULL_VALUE';
        case NullValue.UNRECOGNIZED:
        default:
            return 'UNRECOGNIZED';
    }
}
exports.nullValueToJSON = nullValueToJSON;
function createBaseStruct() {
    return { fields: {} };
}
exports.Struct = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        Object.entries(message.fields).forEach(([key, value]) => {
            if (value !== undefined) {
                exports.Struct_FieldsEntry.encode({ key: key, value }, writer.uint32(10).fork()).ldelim();
            }
        });
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStruct();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    const entry1 = exports.Struct_FieldsEntry.decode(reader, reader.uint32());
                    if (entry1.value !== undefined) {
                        message.fields[entry1.key] = entry1.value;
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
            fields: isObject(object.fields)
                ? Object.entries(object.fields).reduce((acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {})
                : {},
        };
    },
    toJSON(message) {
        const obj = {};
        obj.fields = {};
        if (message.fields) {
            Object.entries(message.fields).forEach(([k, v]) => {
                obj.fields[k] = v;
            });
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseStruct();
        message.fields = Object.entries(object.fields ?? {}).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});
        return message;
    },
    wrap(object) {
        const struct = createBaseStruct();
        if (object !== undefined) {
            Object.keys(object).forEach((key) => {
                struct.fields[key] = object[key];
            });
        }
        return struct;
    },
    unwrap(message) {
        const object = {};
        Object.keys(message.fields).forEach((key) => {
            object[key] = message.fields[key];
        });
        return object;
    },
};
function createBaseStruct_FieldsEntry() {
    return { key: '', value: undefined };
}
exports.Struct_FieldsEntry = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.key !== '') {
            writer.uint32(10).string(message.key);
        }
        if (message.value !== undefined) {
            exports.Value.encode(exports.Value.wrap(message.value), writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStruct_FieldsEntry();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.key = reader.string();
                    break;
                case 2:
                    message.value = exports.Value.unwrap(exports.Value.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { key: isSet(object.key) ? String(object.key) : '', value: isSet(object?.value) ? object.value : undefined };
    },
    toJSON(message) {
        const obj = {};
        message.key !== undefined && (obj.key = message.key);
        message.value !== undefined && (obj.value = message.value);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseStruct_FieldsEntry();
        message.key = object.key ?? '';
        message.value = object.value ?? undefined;
        return message;
    },
};
function createBaseValue() {
    return { kind: undefined };
}
exports.Value = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.kind?.$case === 'nullValue') {
            writer.uint32(8).int32(message.kind.nullValue);
        }
        if (message.kind?.$case === 'numberValue') {
            writer.uint32(17).double(message.kind.numberValue);
        }
        if (message.kind?.$case === 'stringValue') {
            writer.uint32(26).string(message.kind.stringValue);
        }
        if (message.kind?.$case === 'boolValue') {
            writer.uint32(32).bool(message.kind.boolValue);
        }
        if (message.kind?.$case === 'structValue') {
            exports.Struct.encode(exports.Struct.wrap(message.kind.structValue), writer.uint32(42).fork()).ldelim();
        }
        if (message.kind?.$case === 'listValue') {
            exports.ListValue.encode(exports.ListValue.wrap(message.kind.listValue), writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseValue();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.kind = { $case: 'nullValue', nullValue: reader.int32() };
                    break;
                case 2:
                    message.kind = { $case: 'numberValue', numberValue: reader.double() };
                    break;
                case 3:
                    message.kind = { $case: 'stringValue', stringValue: reader.string() };
                    break;
                case 4:
                    message.kind = { $case: 'boolValue', boolValue: reader.bool() };
                    break;
                case 5:
                    message.kind = { $case: 'structValue', structValue: exports.Struct.unwrap(exports.Struct.decode(reader, reader.uint32())) };
                    break;
                case 6:
                    message.kind = { $case: 'listValue', listValue: exports.ListValue.unwrap(exports.ListValue.decode(reader, reader.uint32())) };
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
            kind: isSet(object.nullValue)
                ? { $case: 'nullValue', nullValue: nullValueFromJSON(object.nullValue) }
                : isSet(object.numberValue)
                    ? { $case: 'numberValue', numberValue: Number(object.numberValue) }
                    : isSet(object.stringValue)
                        ? { $case: 'stringValue', stringValue: String(object.stringValue) }
                        : isSet(object.boolValue)
                            ? { $case: 'boolValue', boolValue: Boolean(object.boolValue) }
                            : isSet(object.structValue)
                                ? { $case: 'structValue', structValue: object.structValue }
                                : isSet(object.listValue)
                                    ? { $case: 'listValue', listValue: [...object.listValue] }
                                    : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.kind?.$case === 'nullValue' && (obj.nullValue = message.kind?.nullValue !== undefined ? nullValueToJSON(message.kind?.nullValue) : undefined);
        message.kind?.$case === 'numberValue' && (obj.numberValue = message.kind?.numberValue);
        message.kind?.$case === 'stringValue' && (obj.stringValue = message.kind?.stringValue);
        message.kind?.$case === 'boolValue' && (obj.boolValue = message.kind?.boolValue);
        message.kind?.$case === 'structValue' && (obj.structValue = message.kind?.structValue);
        message.kind?.$case === 'listValue' && (obj.listValue = message.kind?.listValue);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseValue();
        if (object.kind?.$case === 'nullValue' && object.kind?.nullValue !== undefined && object.kind?.nullValue !== null) {
            message.kind = { $case: 'nullValue', nullValue: object.kind.nullValue };
        }
        if (object.kind?.$case === 'numberValue' && object.kind?.numberValue !== undefined && object.kind?.numberValue !== null) {
            message.kind = { $case: 'numberValue', numberValue: object.kind.numberValue };
        }
        if (object.kind?.$case === 'stringValue' && object.kind?.stringValue !== undefined && object.kind?.stringValue !== null) {
            message.kind = { $case: 'stringValue', stringValue: object.kind.stringValue };
        }
        if (object.kind?.$case === 'boolValue' && object.kind?.boolValue !== undefined && object.kind?.boolValue !== null) {
            message.kind = { $case: 'boolValue', boolValue: object.kind.boolValue };
        }
        if (object.kind?.$case === 'structValue' && object.kind?.structValue !== undefined && object.kind?.structValue !== null) {
            message.kind = { $case: 'structValue', structValue: object.kind.structValue };
        }
        if (object.kind?.$case === 'listValue' && object.kind?.listValue !== undefined && object.kind?.listValue !== null) {
            message.kind = { $case: 'listValue', listValue: object.kind.listValue };
        }
        return message;
    },
    wrap(value) {
        const result = createBaseValue();
        if (value === null) {
            result.kind = { $case: 'nullValue', nullValue: NullValue.NULL_VALUE };
        }
        else if (typeof value === 'boolean') {
            result.kind = { $case: 'boolValue', boolValue: value };
        }
        else if (typeof value === 'number') {
            result.kind = { $case: 'numberValue', numberValue: value };
        }
        else if (typeof value === 'string') {
            result.kind = { $case: 'stringValue', stringValue: value };
        }
        else if (Array.isArray(value)) {
            result.kind = { $case: 'listValue', listValue: value };
        }
        else if (typeof value === 'object') {
            result.kind = { $case: 'structValue', structValue: value };
        }
        else if (typeof value !== 'undefined') {
            throw new Error('Unsupported any value type: ' + typeof value);
        }
        return result;
    },
    unwrap(message) {
        if (message.kind?.$case === 'nullValue') {
            return null;
        }
        else if (message.kind?.$case === 'numberValue') {
            return message.kind?.numberValue;
        }
        else if (message.kind?.$case === 'stringValue') {
            return message.kind?.stringValue;
        }
        else if (message.kind?.$case === 'boolValue') {
            return message.kind?.boolValue;
        }
        else if (message.kind?.$case === 'structValue') {
            return message.kind?.structValue;
        }
        else if (message.kind?.$case === 'listValue') {
            return message.kind?.listValue;
        }
        else {
            return undefined;
        }
    },
};
function createBaseListValue() {
    return { values: [] };
}
exports.ListValue = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        for (const v of message.values) {
            exports.Value.encode(exports.Value.wrap(v), writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseListValue();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.values.push(exports.Value.unwrap(exports.Value.decode(reader, reader.uint32())));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { values: Array.isArray(object?.values) ? [...object.values] : [] };
    },
    toJSON(message) {
        const obj = {};
        if (message.values) {
            obj.values = message.values.map((e) => e);
        }
        else {
            obj.values = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseListValue();
        message.values = object.values?.map((e) => e) || [];
        return message;
    },
    wrap(value) {
        const result = createBaseListValue();
        result.values = value ?? [];
        return result;
    },
    unwrap(message) {
        return message.values;
    },
};
function isObject(value) {
    return typeof value === 'object' && value !== null;
}
function isSet(value) {
    return value !== null && value !== undefined;
}
