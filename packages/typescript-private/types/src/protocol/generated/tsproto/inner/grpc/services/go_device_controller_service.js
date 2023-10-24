"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoDeviceControllerServiceService = void 0;
const dc_gdc_1 = require("../../params/dc_gdc");
const dc_gdc_2 = require("../../types/dc_gdc");
exports.GoDeviceControllerServiceService = {
    call: {
        path: '/inner.grpc.services.GoDeviceControllerService/Call',
        requestStream: false,
        responseStream: false,
        requestSerialize: (value) => Buffer.from(dc_gdc_1.DcGdcParam.encode(value).finish()),
        requestDeserialize: (value) => dc_gdc_1.DcGdcParam.decode(value),
        responseSerialize: (value) => Buffer.from(dc_gdc_1.DcGdcResult.encode(value).finish()),
        responseDeserialize: (value) => dc_gdc_1.DcGdcResult.decode(value),
    },
    startStreaming: {
        path: '/inner.grpc.services.GoDeviceControllerService/StartStreaming',
        requestStream: false,
        responseStream: true,
        requestSerialize: (value) => Buffer.from(dc_gdc_2.DcGdcStartStreamingParam.encode(value).finish()),
        requestDeserialize: (value) => dc_gdc_2.DcGdcStartStreamingParam.decode(value),
        responseSerialize: (value) => Buffer.from(dc_gdc_2.DcGdcStartStreamingResult.encode(value).finish()),
        responseDeserialize: (value) => dc_gdc_2.DcGdcStartStreamingResult.decode(value),
    },
};
