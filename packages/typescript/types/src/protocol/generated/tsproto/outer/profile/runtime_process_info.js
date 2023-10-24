"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeProcessInfo = exports.RuntimeProcessInfoNet = exports.RuntimeProcessInfoFs = exports.RuntimeProcessInfoMem = exports.RuntimeProcessInfoCpu = void 0;
/* eslint-disable */
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
function createBaseRuntimeProcessInfoCpu() {
    return { name: '', percent: 0 };
}
exports.RuntimeProcessInfoCpu = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.percent !== 0) {
            writer.uint32(21).float(message.percent);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeProcessInfoCpu();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.percent = reader.float();
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
            percent: isSet(object.percent) ? Number(object.percent) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.percent !== undefined && (obj.percent = message.percent);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeProcessInfoCpu();
        message.name = object.name ?? '';
        message.percent = object.percent ?? 0;
        return message;
    },
};
function createBaseRuntimeProcessInfoMem() {
    return { name: '', percent: 0 };
}
exports.RuntimeProcessInfoMem = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.percent !== 0) {
            writer.uint32(21).float(message.percent);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeProcessInfoMem();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.percent = reader.float();
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
            percent: isSet(object.percent) ? Number(object.percent) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.percent !== undefined && (obj.percent = message.percent);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeProcessInfoMem();
        message.name = object.name ?? '';
        message.percent = object.percent ?? 0;
        return message;
    },
};
function createBaseRuntimeProcessInfoFs() {
    return { name: '', writeBytes: 0, readBytes: 0 };
}
exports.RuntimeProcessInfoFs = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.writeBytes !== 0) {
            writer.uint32(17).fixed64(message.writeBytes);
        }
        if (message.readBytes !== 0) {
            writer.uint32(25).fixed64(message.readBytes);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeProcessInfoFs();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.writeBytes = longToNumber(reader.fixed64());
                    break;
                case 3:
                    message.readBytes = longToNumber(reader.fixed64());
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
            writeBytes: isSet(object.writeBytes) ? Number(object.writeBytes) : 0,
            readBytes: isSet(object.readBytes) ? Number(object.readBytes) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.writeBytes !== undefined && (obj.writeBytes = Math.round(message.writeBytes));
        message.readBytes !== undefined && (obj.readBytes = Math.round(message.readBytes));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeProcessInfoFs();
        message.name = object.name ?? '';
        message.writeBytes = object.writeBytes ?? 0;
        message.readBytes = object.readBytes ?? 0;
        return message;
    },
};
function createBaseRuntimeProcessInfoNet() {
    return { name: '', sendBytes: 0, readBytes: 0 };
}
exports.RuntimeProcessInfoNet = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.sendBytes !== 0) {
            writer.uint32(17).fixed64(message.sendBytes);
        }
        if (message.readBytes !== 0) {
            writer.uint32(25).fixed64(message.readBytes);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeProcessInfoNet();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.sendBytes = longToNumber(reader.fixed64());
                    break;
                case 3:
                    message.readBytes = longToNumber(reader.fixed64());
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
            sendBytes: isSet(object.sendBytes) ? Number(object.sendBytes) : 0,
            readBytes: isSet(object.readBytes) ? Number(object.readBytes) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.sendBytes !== undefined && (obj.sendBytes = Math.round(message.sendBytes));
        message.readBytes !== undefined && (obj.readBytes = Math.round(message.readBytes));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeProcessInfoNet();
        message.name = object.name ?? '';
        message.sendBytes = object.sendBytes ?? 0;
        message.readBytes = object.readBytes ?? 0;
        return message;
    },
};
function createBaseRuntimeProcessInfo() {
    return { name: '', pid: 0, isForeground: false, cpues: [], mems: [], fses: [], nets: [] };
}
exports.RuntimeProcessInfo = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.pid !== 0) {
            writer.uint32(21).fixed32(message.pid);
        }
        if (message.isForeground === true) {
            writer.uint32(24).bool(message.isForeground);
        }
        for (const v of message.cpues) {
            exports.RuntimeProcessInfoCpu.encode(v, writer.uint32(42).fork()).ldelim();
        }
        for (const v of message.mems) {
            exports.RuntimeProcessInfoMem.encode(v, writer.uint32(50).fork()).ldelim();
        }
        for (const v of message.fses) {
            exports.RuntimeProcessInfoFs.encode(v, writer.uint32(58).fork()).ldelim();
        }
        for (const v of message.nets) {
            exports.RuntimeProcessInfoNet.encode(v, writer.uint32(66).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeProcessInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.pid = reader.fixed32();
                    break;
                case 3:
                    message.isForeground = reader.bool();
                    break;
                case 5:
                    message.cpues.push(exports.RuntimeProcessInfoCpu.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.mems.push(exports.RuntimeProcessInfoMem.decode(reader, reader.uint32()));
                    break;
                case 7:
                    message.fses.push(exports.RuntimeProcessInfoFs.decode(reader, reader.uint32()));
                    break;
                case 8:
                    message.nets.push(exports.RuntimeProcessInfoNet.decode(reader, reader.uint32()));
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
            pid: isSet(object.pid) ? Number(object.pid) : 0,
            isForeground: isSet(object.isForeground) ? Boolean(object.isForeground) : false,
            cpues: Array.isArray(object?.cpues) ? object.cpues.map((e) => exports.RuntimeProcessInfoCpu.fromJSON(e)) : [],
            mems: Array.isArray(object?.mems) ? object.mems.map((e) => exports.RuntimeProcessInfoMem.fromJSON(e)) : [],
            fses: Array.isArray(object?.fses) ? object.fses.map((e) => exports.RuntimeProcessInfoFs.fromJSON(e)) : [],
            nets: Array.isArray(object?.nets) ? object.nets.map((e) => exports.RuntimeProcessInfoNet.fromJSON(e)) : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.pid !== undefined && (obj.pid = Math.round(message.pid));
        message.isForeground !== undefined && (obj.isForeground = message.isForeground);
        if (message.cpues) {
            obj.cpues = message.cpues.map((e) => (e ? exports.RuntimeProcessInfoCpu.toJSON(e) : undefined));
        }
        else {
            obj.cpues = [];
        }
        if (message.mems) {
            obj.mems = message.mems.map((e) => (e ? exports.RuntimeProcessInfoMem.toJSON(e) : undefined));
        }
        else {
            obj.mems = [];
        }
        if (message.fses) {
            obj.fses = message.fses.map((e) => (e ? exports.RuntimeProcessInfoFs.toJSON(e) : undefined));
        }
        else {
            obj.fses = [];
        }
        if (message.nets) {
            obj.nets = message.nets.map((e) => (e ? exports.RuntimeProcessInfoNet.toJSON(e) : undefined));
        }
        else {
            obj.nets = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeProcessInfo();
        message.name = object.name ?? '';
        message.pid = object.pid ?? 0;
        message.isForeground = object.isForeground ?? false;
        message.cpues = object.cpues?.map((e) => exports.RuntimeProcessInfoCpu.fromPartial(e)) || [];
        message.mems = object.mems?.map((e) => exports.RuntimeProcessInfoMem.fromPartial(e)) || [];
        message.fses = object.fses?.map((e) => exports.RuntimeProcessInfoFs.fromPartial(e)) || [];
        message.nets = object.nets?.map((e) => exports.RuntimeProcessInfoNet.fromPartial(e)) || [];
        return message;
    },
};
var globalThis = (() => {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    throw 'Unable to locate global object';
})();
function longToNumber(long) {
    if (long.gt(Number.MAX_SAFE_INTEGER)) {
        throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER');
    }
    return long.toNumber();
}
if (minimal_1.default.util.Long !== long_1.default) {
    minimal_1.default.util.Long = long_1.default;
    minimal_1.default.configure();
}
function isSet(value) {
    return value !== null && value !== undefined;
}
