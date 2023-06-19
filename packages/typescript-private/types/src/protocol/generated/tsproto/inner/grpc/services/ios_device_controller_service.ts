/* eslint-disable */
import { handleServerStreamingCall, handleUnaryCall, UntypedServiceImplementation } from '@grpc/grpc-js';
import { DcIdcParam, DcIdcResult } from '../../params/dc_idc';
import { DcIdcStartStreamingParam, DcIdcStartStreamingResult } from '../../types/dc_idc';

export type IosDeviceControllerServiceService = typeof IosDeviceControllerServiceService;
export const IosDeviceControllerServiceService = {
  call: {
    path: '/inner.grpc.services.IosDeviceControllerService/Call',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: DcIdcParam) => Buffer.from(DcIdcParam.encode(value).finish()),
    requestDeserialize: (value: Buffer) => DcIdcParam.decode(value),
    responseSerialize: (value: DcIdcResult) => Buffer.from(DcIdcResult.encode(value).finish()),
    responseDeserialize: (value: Buffer) => DcIdcResult.decode(value),
  },
  startStreaming: {
    path: '/inner.grpc.services.IosDeviceControllerService/StartStreaming',
    requestStream: false,
    responseStream: true,
    requestSerialize: (value: DcIdcStartStreamingParam) => Buffer.from(DcIdcStartStreamingParam.encode(value).finish()),
    requestDeserialize: (value: Buffer) => DcIdcStartStreamingParam.decode(value),
    responseSerialize: (value: DcIdcStartStreamingResult) => Buffer.from(DcIdcStartStreamingResult.encode(value).finish()),
    responseDeserialize: (value: Buffer) => DcIdcStartStreamingResult.decode(value),
  },
} as const;

export interface IosDeviceControllerServiceServer extends UntypedServiceImplementation {
  call: handleUnaryCall<DcIdcParam, DcIdcResult>;
  startStreaming: handleServerStreamingCall<DcIdcStartStreamingParam, DcIdcStartStreamingResult>;
}
