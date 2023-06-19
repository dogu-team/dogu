/* eslint-disable */
import { handleServerStreamingCall, handleUnaryCall, UntypedServiceImplementation } from '@grpc/grpc-js';
import { DcGdcParam, DcGdcResult } from '../../params/dc_gdc';
import { DcGdcStartStreamingParam, DcGdcStartStreamingResult } from '../../types/dc_gdc';

export type GoDeviceControllerServiceService = typeof GoDeviceControllerServiceService;
export const GoDeviceControllerServiceService = {
  call: {
    path: '/inner.grpc.services.GoDeviceControllerService/Call',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: DcGdcParam) => Buffer.from(DcGdcParam.encode(value).finish()),
    requestDeserialize: (value: Buffer) => DcGdcParam.decode(value),
    responseSerialize: (value: DcGdcResult) => Buffer.from(DcGdcResult.encode(value).finish()),
    responseDeserialize: (value: Buffer) => DcGdcResult.decode(value),
  },
  startStreaming: {
    path: '/inner.grpc.services.GoDeviceControllerService/StartStreaming',
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: DcGdcStartStreamingParam) => Buffer.from(DcGdcStartStreamingParam.encode(value).finish()),
    requestDeserialize: (value: Buffer) => DcGdcStartStreamingParam.decode(value),
    responseSerialize: (value: DcGdcStartStreamingResult) => Buffer.from(DcGdcStartStreamingResult.encode(value).finish()),
    responseDeserialize: (value: Buffer) => DcGdcStartStreamingResult.decode(value),
  },
} as const;

export interface GoDeviceControllerServiceServer extends UntypedServiceImplementation {
  call: handleUnaryCall<DcGdcParam, DcGdcResult>;
  startStreaming: handleServerStreamingCall<DcGdcStartStreamingParam, DcGdcStartStreamingResult>;
}
