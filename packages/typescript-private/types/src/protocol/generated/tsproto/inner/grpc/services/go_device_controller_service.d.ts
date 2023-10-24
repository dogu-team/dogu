/// <reference types="node" />
import { handleServerStreamingCall, handleUnaryCall, UntypedServiceImplementation } from '@grpc/grpc-js';
import { DcGdcParam, DcGdcResult } from '../../params/dc_gdc';
import { DcGdcStartStreamingParam, DcGdcStartStreamingResult } from '../../types/dc_gdc';
export declare type GoDeviceControllerServiceService = typeof GoDeviceControllerServiceService;
export declare const GoDeviceControllerServiceService: {
    readonly call: {
        readonly path: "/inner.grpc.services.GoDeviceControllerService/Call";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: DcGdcParam) => Buffer;
        readonly requestDeserialize: (value: Buffer) => DcGdcParam;
        readonly responseSerialize: (value: DcGdcResult) => Buffer;
        readonly responseDeserialize: (value: Buffer) => DcGdcResult;
    };
    readonly startStreaming: {
        readonly path: "/inner.grpc.services.GoDeviceControllerService/StartStreaming";
        readonly requestStream: false;
        readonly responseStream: true;
        readonly requestSerialize: (value: DcGdcStartStreamingParam) => Buffer;
        readonly requestDeserialize: (value: Buffer) => DcGdcStartStreamingParam;
        readonly responseSerialize: (value: DcGdcStartStreamingResult) => Buffer;
        readonly responseDeserialize: (value: Buffer) => DcGdcStartStreamingResult;
    };
};
export interface GoDeviceControllerServiceServer extends UntypedServiceImplementation {
    call: handleUnaryCall<DcGdcParam, DcGdcResult>;
    startStreaming: handleServerStreamingCall<DcGdcStartStreamingParam, DcGdcStartStreamingResult>;
}
