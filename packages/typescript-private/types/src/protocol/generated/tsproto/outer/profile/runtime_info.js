"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeInfo = exports.RuntimeInfoBattery = exports.RuntimeInfoDisplay = exports.RuntimeInfoNet = exports.RuntimeInfoFs = exports.RuntimeInfoMem = exports.RuntimeInfoGpu = exports.RuntimeInfoCpuFreq = exports.RuntimeInfoCpu = void 0;
/* eslint-disable */
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const timestamp_1 = require("../../google/protobuf/timestamp");
const platform_1 = require("../platform");
const runtime_process_info_1 = require("./runtime_process_info");
function createBaseRuntimeInfoCpu() {
    return {
        name: '',
        currentLoad: 0,
        currentLoadUser: 0,
        currentLoadSystem: 0,
        currentLoadNice: 0,
        currentLoadIdle: 0,
        currentLoadIrq: 0,
        currentLoadCpu: 0,
    };
}
exports.RuntimeInfoCpu = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.currentLoad !== 0) {
            writer.uint32(17).fixed64(message.currentLoad);
        }
        if (message.currentLoadUser !== 0) {
            writer.uint32(25).fixed64(message.currentLoadUser);
        }
        if (message.currentLoadSystem !== 0) {
            writer.uint32(33).fixed64(message.currentLoadSystem);
        }
        if (message.currentLoadNice !== 0) {
            writer.uint32(41).fixed64(message.currentLoadNice);
        }
        if (message.currentLoadIdle !== 0) {
            writer.uint32(49).fixed64(message.currentLoadIdle);
        }
        if (message.currentLoadIrq !== 0) {
            writer.uint32(57).fixed64(message.currentLoadIrq);
        }
        if (message.currentLoadCpu !== 0) {
            writer.uint32(65).fixed64(message.currentLoadCpu);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeInfoCpu();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.currentLoad = longToNumber(reader.fixed64());
                    break;
                case 3:
                    message.currentLoadUser = longToNumber(reader.fixed64());
                    break;
                case 4:
                    message.currentLoadSystem = longToNumber(reader.fixed64());
                    break;
                case 5:
                    message.currentLoadNice = longToNumber(reader.fixed64());
                    break;
                case 6:
                    message.currentLoadIdle = longToNumber(reader.fixed64());
                    break;
                case 7:
                    message.currentLoadIrq = longToNumber(reader.fixed64());
                    break;
                case 8:
                    message.currentLoadCpu = longToNumber(reader.fixed64());
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
            currentLoad: isSet(object.currentLoad) ? Number(object.currentLoad) : 0,
            currentLoadUser: isSet(object.currentLoadUser) ? Number(object.currentLoadUser) : 0,
            currentLoadSystem: isSet(object.currentLoadSystem) ? Number(object.currentLoadSystem) : 0,
            currentLoadNice: isSet(object.currentLoadNice) ? Number(object.currentLoadNice) : 0,
            currentLoadIdle: isSet(object.currentLoadIdle) ? Number(object.currentLoadIdle) : 0,
            currentLoadIrq: isSet(object.currentLoadIrq) ? Number(object.currentLoadIrq) : 0,
            currentLoadCpu: isSet(object.currentLoadCpu) ? Number(object.currentLoadCpu) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.currentLoad !== undefined && (obj.currentLoad = Math.round(message.currentLoad));
        message.currentLoadUser !== undefined && (obj.currentLoadUser = Math.round(message.currentLoadUser));
        message.currentLoadSystem !== undefined && (obj.currentLoadSystem = Math.round(message.currentLoadSystem));
        message.currentLoadNice !== undefined && (obj.currentLoadNice = Math.round(message.currentLoadNice));
        message.currentLoadIdle !== undefined && (obj.currentLoadIdle = Math.round(message.currentLoadIdle));
        message.currentLoadIrq !== undefined && (obj.currentLoadIrq = Math.round(message.currentLoadIrq));
        message.currentLoadCpu !== undefined && (obj.currentLoadCpu = Math.round(message.currentLoadCpu));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeInfoCpu();
        message.name = object.name ?? '';
        message.currentLoad = object.currentLoad ?? 0;
        message.currentLoadUser = object.currentLoadUser ?? 0;
        message.currentLoadSystem = object.currentLoadSystem ?? 0;
        message.currentLoadNice = object.currentLoadNice ?? 0;
        message.currentLoadIdle = object.currentLoadIdle ?? 0;
        message.currentLoadIrq = object.currentLoadIrq ?? 0;
        message.currentLoadCpu = object.currentLoadCpu ?? 0;
        return message;
    },
};
function createBaseRuntimeInfoCpuFreq() {
    return { idx: 0, min: 0, cur: 0, max: 0 };
}
exports.RuntimeInfoCpuFreq = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.idx !== 0) {
            writer.uint32(13).fixed32(message.idx);
        }
        if (message.min !== 0) {
            writer.uint32(17).fixed64(message.min);
        }
        if (message.cur !== 0) {
            writer.uint32(25).fixed64(message.cur);
        }
        if (message.max !== 0) {
            writer.uint32(33).fixed64(message.max);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeInfoCpuFreq();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.idx = reader.fixed32();
                    break;
                case 2:
                    message.min = longToNumber(reader.fixed64());
                    break;
                case 3:
                    message.cur = longToNumber(reader.fixed64());
                    break;
                case 4:
                    message.max = longToNumber(reader.fixed64());
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
            idx: isSet(object.idx) ? Number(object.idx) : 0,
            min: isSet(object.min) ? Number(object.min) : 0,
            cur: isSet(object.cur) ? Number(object.cur) : 0,
            max: isSet(object.max) ? Number(object.max) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.idx !== undefined && (obj.idx = Math.round(message.idx));
        message.min !== undefined && (obj.min = Math.round(message.min));
        message.cur !== undefined && (obj.cur = Math.round(message.cur));
        message.max !== undefined && (obj.max = Math.round(message.max));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeInfoCpuFreq();
        message.idx = object.idx ?? 0;
        message.min = object.min ?? 0;
        message.cur = object.cur ?? 0;
        message.max = object.max ?? 0;
        return message;
    },
};
function createBaseRuntimeInfoGpu() {
    return { desc: '' };
}
exports.RuntimeInfoGpu = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.desc !== '') {
            writer.uint32(10).string(message.desc);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeInfoGpu();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.desc = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { desc: isSet(object.desc) ? String(object.desc) : '' };
    },
    toJSON(message) {
        const obj = {};
        message.desc !== undefined && (obj.desc = message.desc);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeInfoGpu();
        message.desc = object.desc ?? '';
        return message;
    },
};
function createBaseRuntimeInfoMem() {
    return {
        name: '',
        total: 0,
        free: 0,
        used: 0,
        active: 0,
        available: 0,
        swaptotal: 0,
        swapused: 0,
        swapfree: 0,
        isLow: false,
    };
}
exports.RuntimeInfoMem = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.total !== 0) {
            writer.uint32(17).fixed64(message.total);
        }
        if (message.free !== 0) {
            writer.uint32(25).fixed64(message.free);
        }
        if (message.used !== 0) {
            writer.uint32(33).fixed64(message.used);
        }
        if (message.active !== 0) {
            writer.uint32(41).fixed64(message.active);
        }
        if (message.available !== 0) {
            writer.uint32(49).fixed64(message.available);
        }
        if (message.swaptotal !== 0) {
            writer.uint32(57).fixed64(message.swaptotal);
        }
        if (message.swapused !== 0) {
            writer.uint32(65).fixed64(message.swapused);
        }
        if (message.swapfree !== 0) {
            writer.uint32(73).fixed64(message.swapfree);
        }
        if (message.isLow === true) {
            writer.uint32(80).bool(message.isLow);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeInfoMem();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.total = longToNumber(reader.fixed64());
                    break;
                case 3:
                    message.free = longToNumber(reader.fixed64());
                    break;
                case 4:
                    message.used = longToNumber(reader.fixed64());
                    break;
                case 5:
                    message.active = longToNumber(reader.fixed64());
                    break;
                case 6:
                    message.available = longToNumber(reader.fixed64());
                    break;
                case 7:
                    message.swaptotal = longToNumber(reader.fixed64());
                    break;
                case 8:
                    message.swapused = longToNumber(reader.fixed64());
                    break;
                case 9:
                    message.swapfree = longToNumber(reader.fixed64());
                    break;
                case 10:
                    message.isLow = reader.bool();
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
            total: isSet(object.total) ? Number(object.total) : 0,
            free: isSet(object.free) ? Number(object.free) : 0,
            used: isSet(object.used) ? Number(object.used) : 0,
            active: isSet(object.active) ? Number(object.active) : 0,
            available: isSet(object.available) ? Number(object.available) : 0,
            swaptotal: isSet(object.swaptotal) ? Number(object.swaptotal) : 0,
            swapused: isSet(object.swapused) ? Number(object.swapused) : 0,
            swapfree: isSet(object.swapfree) ? Number(object.swapfree) : 0,
            isLow: isSet(object.isLow) ? Boolean(object.isLow) : false,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.total !== undefined && (obj.total = Math.round(message.total));
        message.free !== undefined && (obj.free = Math.round(message.free));
        message.used !== undefined && (obj.used = Math.round(message.used));
        message.active !== undefined && (obj.active = Math.round(message.active));
        message.available !== undefined && (obj.available = Math.round(message.available));
        message.swaptotal !== undefined && (obj.swaptotal = Math.round(message.swaptotal));
        message.swapused !== undefined && (obj.swapused = Math.round(message.swapused));
        message.swapfree !== undefined && (obj.swapfree = Math.round(message.swapfree));
        message.isLow !== undefined && (obj.isLow = message.isLow);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeInfoMem();
        message.name = object.name ?? '';
        message.total = object.total ?? 0;
        message.free = object.free ?? 0;
        message.used = object.used ?? 0;
        message.active = object.active ?? 0;
        message.available = object.available ?? 0;
        message.swaptotal = object.swaptotal ?? 0;
        message.swapused = object.swapused ?? 0;
        message.swapfree = object.swapfree ?? 0;
        message.isLow = object.isLow ?? false;
        return message;
    },
};
function createBaseRuntimeInfoFs() {
    return {
        name: '',
        type: '',
        mount: '',
        size: 0,
        used: 0,
        available: 0,
        use: 0,
        readsCompleted: 0,
        timeSpentReadMs: 0,
        writesCompleted: 0,
        timeSpentWriteMs: 0,
    };
}
exports.RuntimeInfoFs = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.type !== '') {
            writer.uint32(18).string(message.type);
        }
        if (message.mount !== '') {
            writer.uint32(26).string(message.mount);
        }
        if (message.size !== 0) {
            writer.uint32(33).fixed64(message.size);
        }
        if (message.used !== 0) {
            writer.uint32(41).fixed64(message.used);
        }
        if (message.available !== 0) {
            writer.uint32(49).fixed64(message.available);
        }
        if (message.use !== 0) {
            writer.uint32(57).fixed64(message.use);
        }
        if (message.readsCompleted !== 0) {
            writer.uint32(65).fixed64(message.readsCompleted);
        }
        if (message.timeSpentReadMs !== 0) {
            writer.uint32(73).fixed64(message.timeSpentReadMs);
        }
        if (message.writesCompleted !== 0) {
            writer.uint32(81).fixed64(message.writesCompleted);
        }
        if (message.timeSpentWriteMs !== 0) {
            writer.uint32(89).fixed64(message.timeSpentWriteMs);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeInfoFs();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.type = reader.string();
                    break;
                case 3:
                    message.mount = reader.string();
                    break;
                case 4:
                    message.size = longToNumber(reader.fixed64());
                    break;
                case 5:
                    message.used = longToNumber(reader.fixed64());
                    break;
                case 6:
                    message.available = longToNumber(reader.fixed64());
                    break;
                case 7:
                    message.use = longToNumber(reader.fixed64());
                    break;
                case 8:
                    message.readsCompleted = longToNumber(reader.fixed64());
                    break;
                case 9:
                    message.timeSpentReadMs = longToNumber(reader.fixed64());
                    break;
                case 10:
                    message.writesCompleted = longToNumber(reader.fixed64());
                    break;
                case 11:
                    message.timeSpentWriteMs = longToNumber(reader.fixed64());
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
            type: isSet(object.type) ? String(object.type) : '',
            mount: isSet(object.mount) ? String(object.mount) : '',
            size: isSet(object.size) ? Number(object.size) : 0,
            used: isSet(object.used) ? Number(object.used) : 0,
            available: isSet(object.available) ? Number(object.available) : 0,
            use: isSet(object.use) ? Number(object.use) : 0,
            readsCompleted: isSet(object.readsCompleted) ? Number(object.readsCompleted) : 0,
            timeSpentReadMs: isSet(object.timeSpentReadMs) ? Number(object.timeSpentReadMs) : 0,
            writesCompleted: isSet(object.writesCompleted) ? Number(object.writesCompleted) : 0,
            timeSpentWriteMs: isSet(object.timeSpentWriteMs) ? Number(object.timeSpentWriteMs) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.type !== undefined && (obj.type = message.type);
        message.mount !== undefined && (obj.mount = message.mount);
        message.size !== undefined && (obj.size = Math.round(message.size));
        message.used !== undefined && (obj.used = Math.round(message.used));
        message.available !== undefined && (obj.available = Math.round(message.available));
        message.use !== undefined && (obj.use = Math.round(message.use));
        message.readsCompleted !== undefined && (obj.readsCompleted = Math.round(message.readsCompleted));
        message.timeSpentReadMs !== undefined && (obj.timeSpentReadMs = Math.round(message.timeSpentReadMs));
        message.writesCompleted !== undefined && (obj.writesCompleted = Math.round(message.writesCompleted));
        message.timeSpentWriteMs !== undefined && (obj.timeSpentWriteMs = Math.round(message.timeSpentWriteMs));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeInfoFs();
        message.name = object.name ?? '';
        message.type = object.type ?? '';
        message.mount = object.mount ?? '';
        message.size = object.size ?? 0;
        message.used = object.used ?? 0;
        message.available = object.available ?? 0;
        message.use = object.use ?? 0;
        message.readsCompleted = object.readsCompleted ?? 0;
        message.timeSpentReadMs = object.timeSpentReadMs ?? 0;
        message.writesCompleted = object.writesCompleted ?? 0;
        message.timeSpentWriteMs = object.timeSpentWriteMs ?? 0;
        return message;
    },
};
function createBaseRuntimeInfoNet() {
    return {
        name: '',
        mobileRxbytes: 0,
        mobileTxbytes: 0,
        wifiRxbytes: 0,
        wifiTxbytes: 0,
        totalRxbytes: 0,
        totalTxbytes: 0,
    };
}
exports.RuntimeInfoNet = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.mobileRxbytes !== 0) {
            writer.uint32(17).fixed64(message.mobileRxbytes);
        }
        if (message.mobileTxbytes !== 0) {
            writer.uint32(25).fixed64(message.mobileTxbytes);
        }
        if (message.wifiRxbytes !== 0) {
            writer.uint32(33).fixed64(message.wifiRxbytes);
        }
        if (message.wifiTxbytes !== 0) {
            writer.uint32(41).fixed64(message.wifiTxbytes);
        }
        if (message.totalRxbytes !== 0) {
            writer.uint32(49).fixed64(message.totalRxbytes);
        }
        if (message.totalTxbytes !== 0) {
            writer.uint32(57).fixed64(message.totalTxbytes);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeInfoNet();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.mobileRxbytes = longToNumber(reader.fixed64());
                    break;
                case 3:
                    message.mobileTxbytes = longToNumber(reader.fixed64());
                    break;
                case 4:
                    message.wifiRxbytes = longToNumber(reader.fixed64());
                    break;
                case 5:
                    message.wifiTxbytes = longToNumber(reader.fixed64());
                    break;
                case 6:
                    message.totalRxbytes = longToNumber(reader.fixed64());
                    break;
                case 7:
                    message.totalTxbytes = longToNumber(reader.fixed64());
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
            mobileRxbytes: isSet(object.mobileRxbytes) ? Number(object.mobileRxbytes) : 0,
            mobileTxbytes: isSet(object.mobileTxbytes) ? Number(object.mobileTxbytes) : 0,
            wifiRxbytes: isSet(object.wifiRxbytes) ? Number(object.wifiRxbytes) : 0,
            wifiTxbytes: isSet(object.wifiTxbytes) ? Number(object.wifiTxbytes) : 0,
            totalRxbytes: isSet(object.totalRxbytes) ? Number(object.totalRxbytes) : 0,
            totalTxbytes: isSet(object.totalTxbytes) ? Number(object.totalTxbytes) : 0,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.mobileRxbytes !== undefined && (obj.mobileRxbytes = Math.round(message.mobileRxbytes));
        message.mobileTxbytes !== undefined && (obj.mobileTxbytes = Math.round(message.mobileTxbytes));
        message.wifiRxbytes !== undefined && (obj.wifiRxbytes = Math.round(message.wifiRxbytes));
        message.wifiTxbytes !== undefined && (obj.wifiTxbytes = Math.round(message.wifiTxbytes));
        message.totalRxbytes !== undefined && (obj.totalRxbytes = Math.round(message.totalRxbytes));
        message.totalTxbytes !== undefined && (obj.totalTxbytes = Math.round(message.totalTxbytes));
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeInfoNet();
        message.name = object.name ?? '';
        message.mobileRxbytes = object.mobileRxbytes ?? 0;
        message.mobileTxbytes = object.mobileTxbytes ?? 0;
        message.wifiRxbytes = object.wifiRxbytes ?? 0;
        message.wifiTxbytes = object.wifiTxbytes ?? 0;
        message.totalRxbytes = object.totalRxbytes ?? 0;
        message.totalTxbytes = object.totalTxbytes ?? 0;
        return message;
    },
};
function createBaseRuntimeInfoDisplay() {
    return { name: '', isScreenOn: false, error: undefined };
}
exports.RuntimeInfoDisplay = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.name !== '') {
            writer.uint32(10).string(message.name);
        }
        if (message.isScreenOn === true) {
            writer.uint32(16).bool(message.isScreenOn);
        }
        if (message.error !== undefined) {
            writer.uint32(26).string(message.error);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeInfoDisplay();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.isScreenOn = reader.bool();
                    break;
                case 3:
                    message.error = reader.string();
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
            isScreenOn: isSet(object.isScreenOn) ? Boolean(object.isScreenOn) : false,
            error: isSet(object.error) ? String(object.error) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.name !== undefined && (obj.name = message.name);
        message.isScreenOn !== undefined && (obj.isScreenOn = message.isScreenOn);
        message.error !== undefined && (obj.error = message.error);
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeInfoDisplay();
        message.name = object.name ?? '';
        message.isScreenOn = object.isScreenOn ?? false;
        message.error = object.error ?? undefined;
        return message;
    },
};
function createBaseRuntimeInfoBattery() {
    return { name: '', percent: 0 };
}
exports.RuntimeInfoBattery = {
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
        const message = createBaseRuntimeInfoBattery();
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
        const message = createBaseRuntimeInfoBattery();
        message.name = object.name ?? '';
        message.percent = object.percent ?? 0;
        return message;
    },
};
function createBaseRuntimeInfo() {
    return {
        platform: undefined,
        localTimeStamp: undefined,
        cpues: [],
        cpufreqs: [],
        gpues: [],
        mems: [],
        fses: [],
        nets: [],
        displays: [],
        batteries: [],
        processes: [],
    };
}
exports.RuntimeInfo = {
    encode(message, writer = minimal_1.default.Writer.create()) {
        if (message.platform !== undefined) {
            writer.uint32(8).int32(message.platform);
        }
        if (message.localTimeStamp !== undefined) {
            timestamp_1.Timestamp.encode(toTimestamp(message.localTimeStamp), writer.uint32(82).fork()).ldelim();
        }
        for (const v of message.cpues) {
            exports.RuntimeInfoCpu.encode(v, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.cpufreqs) {
            exports.RuntimeInfoCpuFreq.encode(v, writer.uint32(26).fork()).ldelim();
        }
        for (const v of message.gpues) {
            exports.RuntimeInfoGpu.encode(v, writer.uint32(34).fork()).ldelim();
        }
        for (const v of message.mems) {
            exports.RuntimeInfoMem.encode(v, writer.uint32(42).fork()).ldelim();
        }
        for (const v of message.fses) {
            exports.RuntimeInfoFs.encode(v, writer.uint32(50).fork()).ldelim();
        }
        for (const v of message.nets) {
            exports.RuntimeInfoNet.encode(v, writer.uint32(58).fork()).ldelim();
        }
        for (const v of message.displays) {
            exports.RuntimeInfoDisplay.encode(v, writer.uint32(66).fork()).ldelim();
        }
        for (const v of message.batteries) {
            exports.RuntimeInfoBattery.encode(v, writer.uint32(74).fork()).ldelim();
        }
        for (const v of message.processes) {
            runtime_process_info_1.RuntimeProcessInfo.encode(v, writer.uint32(90).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof minimal_1.default.Reader ? input : new minimal_1.default.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRuntimeInfo();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.platform = reader.int32();
                    break;
                case 10:
                    message.localTimeStamp = fromTimestamp(timestamp_1.Timestamp.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.cpues.push(exports.RuntimeInfoCpu.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.cpufreqs.push(exports.RuntimeInfoCpuFreq.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.gpues.push(exports.RuntimeInfoGpu.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.mems.push(exports.RuntimeInfoMem.decode(reader, reader.uint32()));
                    break;
                case 6:
                    message.fses.push(exports.RuntimeInfoFs.decode(reader, reader.uint32()));
                    break;
                case 7:
                    message.nets.push(exports.RuntimeInfoNet.decode(reader, reader.uint32()));
                    break;
                case 8:
                    message.displays.push(exports.RuntimeInfoDisplay.decode(reader, reader.uint32()));
                    break;
                case 9:
                    message.batteries.push(exports.RuntimeInfoBattery.decode(reader, reader.uint32()));
                    break;
                case 11:
                    message.processes.push(runtime_process_info_1.RuntimeProcessInfo.decode(reader, reader.uint32()));
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
            platform: isSet(object.platform) ? (0, platform_1.platformFromJSON)(object.platform) : undefined,
            localTimeStamp: isSet(object.localTimeStamp) ? fromJsonTimestamp(object.localTimeStamp) : undefined,
            cpues: Array.isArray(object?.cpues) ? object.cpues.map((e) => exports.RuntimeInfoCpu.fromJSON(e)) : [],
            cpufreqs: Array.isArray(object?.cpufreqs) ? object.cpufreqs.map((e) => exports.RuntimeInfoCpuFreq.fromJSON(e)) : [],
            gpues: Array.isArray(object?.gpues) ? object.gpues.map((e) => exports.RuntimeInfoGpu.fromJSON(e)) : [],
            mems: Array.isArray(object?.mems) ? object.mems.map((e) => exports.RuntimeInfoMem.fromJSON(e)) : [],
            fses: Array.isArray(object?.fses) ? object.fses.map((e) => exports.RuntimeInfoFs.fromJSON(e)) : [],
            nets: Array.isArray(object?.nets) ? object.nets.map((e) => exports.RuntimeInfoNet.fromJSON(e)) : [],
            displays: Array.isArray(object?.displays) ? object.displays.map((e) => exports.RuntimeInfoDisplay.fromJSON(e)) : [],
            batteries: Array.isArray(object?.batteries) ? object.batteries.map((e) => exports.RuntimeInfoBattery.fromJSON(e)) : [],
            processes: Array.isArray(object?.processes) ? object.processes.map((e) => runtime_process_info_1.RuntimeProcessInfo.fromJSON(e)) : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.platform !== undefined && (obj.platform = message.platform !== undefined ? (0, platform_1.platformToJSON)(message.platform) : undefined);
        message.localTimeStamp !== undefined && (obj.localTimeStamp = message.localTimeStamp.toISOString());
        if (message.cpues) {
            obj.cpues = message.cpues.map((e) => (e ? exports.RuntimeInfoCpu.toJSON(e) : undefined));
        }
        else {
            obj.cpues = [];
        }
        if (message.cpufreqs) {
            obj.cpufreqs = message.cpufreqs.map((e) => (e ? exports.RuntimeInfoCpuFreq.toJSON(e) : undefined));
        }
        else {
            obj.cpufreqs = [];
        }
        if (message.gpues) {
            obj.gpues = message.gpues.map((e) => (e ? exports.RuntimeInfoGpu.toJSON(e) : undefined));
        }
        else {
            obj.gpues = [];
        }
        if (message.mems) {
            obj.mems = message.mems.map((e) => (e ? exports.RuntimeInfoMem.toJSON(e) : undefined));
        }
        else {
            obj.mems = [];
        }
        if (message.fses) {
            obj.fses = message.fses.map((e) => (e ? exports.RuntimeInfoFs.toJSON(e) : undefined));
        }
        else {
            obj.fses = [];
        }
        if (message.nets) {
            obj.nets = message.nets.map((e) => (e ? exports.RuntimeInfoNet.toJSON(e) : undefined));
        }
        else {
            obj.nets = [];
        }
        if (message.displays) {
            obj.displays = message.displays.map((e) => (e ? exports.RuntimeInfoDisplay.toJSON(e) : undefined));
        }
        else {
            obj.displays = [];
        }
        if (message.batteries) {
            obj.batteries = message.batteries.map((e) => (e ? exports.RuntimeInfoBattery.toJSON(e) : undefined));
        }
        else {
            obj.batteries = [];
        }
        if (message.processes) {
            obj.processes = message.processes.map((e) => (e ? runtime_process_info_1.RuntimeProcessInfo.toJSON(e) : undefined));
        }
        else {
            obj.processes = [];
        }
        return obj;
    },
    fromPartial(object) {
        const message = createBaseRuntimeInfo();
        message.platform = object.platform ?? undefined;
        message.localTimeStamp = object.localTimeStamp ?? undefined;
        message.cpues = object.cpues?.map((e) => exports.RuntimeInfoCpu.fromPartial(e)) || [];
        message.cpufreqs = object.cpufreqs?.map((e) => exports.RuntimeInfoCpuFreq.fromPartial(e)) || [];
        message.gpues = object.gpues?.map((e) => exports.RuntimeInfoGpu.fromPartial(e)) || [];
        message.mems = object.mems?.map((e) => exports.RuntimeInfoMem.fromPartial(e)) || [];
        message.fses = object.fses?.map((e) => exports.RuntimeInfoFs.fromPartial(e)) || [];
        message.nets = object.nets?.map((e) => exports.RuntimeInfoNet.fromPartial(e)) || [];
        message.displays = object.displays?.map((e) => exports.RuntimeInfoDisplay.fromPartial(e)) || [];
        message.batteries = object.batteries?.map((e) => exports.RuntimeInfoBattery.fromPartial(e)) || [];
        message.processes = object.processes?.map((e) => runtime_process_info_1.RuntimeProcessInfo.fromPartial(e)) || [];
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
function toTimestamp(date) {
    const seconds = date.getTime() / 1000;
    const nanos = (date.getTime() % 1000) * 1000000;
    return { seconds, nanos };
}
function fromTimestamp(t) {
    let millis = t.seconds * 1000;
    millis += t.nanos / 1000000;
    return new Date(millis);
}
function fromJsonTimestamp(o) {
    if (o instanceof Date) {
        return o;
    }
    else if (typeof o === 'string') {
        return new Date(o);
    }
    else {
        return fromTimestamp(timestamp_1.Timestamp.fromJSON(o));
    }
}
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
