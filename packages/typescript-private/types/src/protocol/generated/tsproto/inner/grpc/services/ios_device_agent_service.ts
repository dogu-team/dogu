/* eslint-disable */
import { handleBidiStreamingCall, handleUnaryCall, UntypedServiceImplementation } from '@grpc/grpc-js';
import { Empty } from '../../../google/protobuf/empty';
import { CfGdcDaParamList, CfGdcDaResultList } from '../../params/cf_gdc_da';
import { DcIdaParam, DcIdaResult } from '../../params/dc_ida';

export type IosDeviceAgentServiceService = typeof IosDeviceAgentServiceService;
export const IosDeviceAgentServiceService = {
  relay: {
    path: '/inner.grpc.services.IosDeviceAgentService/Relay',
    requestStream: true,
    responseStream: true,
    requestSerialize: (value: CfGdcDaParamList) => Buffer.from(CfGdcDaParamList.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CfGdcDaParamList.decode(value),
    responseSerialize: (value: CfGdcDaResultList) => Buffer.from(CfGdcDaResultList.encode(value).finish()),
    responseDeserialize: (value: Buffer) => CfGdcDaResultList.decode(value),
  },
  checkHealth: {
    path: '/inner.grpc.services.IosDeviceAgentService/CheckHealth',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Empty.decode(value),
    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Empty.decode(value),
  },
  call: {
    path: '/inner.grpc.services.IosDeviceAgentService/Call',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: DcIdaParam) => Buffer.from(DcIdaParam.encode(value).finish()),
    requestDeserialize: (value: Buffer) => DcIdaParam.decode(value),
    responseSerialize: (value: DcIdaResult) => Buffer.from(DcIdaResult.encode(value).finish()),
    responseDeserialize: (value: Buffer) => DcIdaResult.decode(value),
  },
} as const;

export interface IosDeviceAgentServiceServer extends UntypedServiceImplementation {
  relay: handleBidiStreamingCall<CfGdcDaParamList, CfGdcDaResultList>;
  checkHealth: handleUnaryCall<Empty, Empty>;
  call: handleUnaryCall<DcIdaParam, DcIdaResult>;
}
