import { GRPC_ACTION_NOT_FOUND_ERROR, GRPC_CLIENT_NOT_FOUND_ERROR, GRPC_RETURN_NOT_FOUND_ERROR, OneofUnionTypes, PrivateProtocol } from '@dogu-private/types';
import { IosDeviceAgentServiceService } from '@dogu-private/types/protocol/generated/tsproto/inner/grpc/services/ios_device_agent_service';
import { GrpcClientBase } from '@dogu-private/types/protocol/grpc/base';
import { Printable } from '@dogu-tech/common';
import { credentials, makeClientConstructor, ServiceError } from '@grpc/grpc-js';
import { DeviceAgentService } from '../../services/device-agent/device-agent-service';

type DcIdaParam = PrivateProtocol.DcIdaParam;
type DcIdaResult = PrivateProtocol.DcIdaResult;
type DcIdaRunAppParam = PrivateProtocol.DcIdaRunAppParam;
type DcIdaRunAppResult = PrivateProtocol.DcIdaRunAppResult;

export type DcIdaParamKeys = OneofUnionTypes.UnionValueKeys<DcIdaParam>;
export type DcIdaParamUnionPick<Key> = OneofUnionTypes.UnionValuePick<DcIdaParam, Key>;
export type DcIdaParamUnionPickValue<Key extends keyof DcIdaParamUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<DcIdaParam, Key>;

export type DcIdaResultKeys = OneofUnionTypes.UnionValueKeys<DcIdaResult>;
export type DcIdaResultUnionPick<Key> = OneofUnionTypes.UnionValuePick<DcIdaResult, Key>;
export type DcIdaResultUnionPickValue<Key extends keyof DcIdaResultUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<DcIdaResult, Key>;

const ServiceDefenition = IosDeviceAgentServiceService;

export class IosDeviceAgentService extends GrpcClientBase implements DeviceAgentService {
  constructor(private readonly screenPort: number, private readonly grpcServerUrl: string, timeoutSeconds: number, private readonly logger: Printable) {
    super(grpcServerUrl, timeoutSeconds);
  }
  get screenUrl(): string {
    return `127.0.0.1:${this.screenPort}`;
  }

  get inputUrl(): string {
    return this.grpcServerUrl;
  }

  install(): Promise<void> {
    return Promise.resolve();
  }

  async connect(): Promise<void> {
    const constructor = makeClientConstructor(ServiceDefenition, 'IosDeviceAgentServiceService', GrpcClientBase.createClientOption());
    this.client = new constructor(this.serverUrl, credentials.createInsecure());
    await this.waitForReady();
  }

  async checkHealth(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        throw GRPC_CLIENT_NOT_FOUND_ERROR;
      }

      this.client.makeUnaryRequest<DcIdaParam, DcIdaResult>(
        ServiceDefenition.checkHealth.path,
        ServiceDefenition.checkHealth.requestSerialize,
        ServiceDefenition.checkHealth.responseDeserialize,
        {},
        this.createMetadata(),
        // TODO(henry): 개발 중 타임아웃 발생해서 주석처리함
        // this.createCallOptions(),
        (error?: ServiceError | null, value?: DcIdaResult) => {
          if (error) {
            reject(error);
            return;
          }

          if (value == null) {
            reject(GRPC_ACTION_NOT_FOUND_ERROR);
            return;
          }

          resolve();
        },
      );
    });
  }

  async runApp(param: DcIdaRunAppParam): Promise<DcIdaRunAppResult> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        throw GRPC_CLIENT_NOT_FOUND_ERROR;
      }

      const dcIdaParam: DcIdaParam = {
        value: {
          $case: 'dcIdaRunappParam',
          dcIdaRunappParam: param,
        },
      };
      this.client.makeUnaryRequest<DcIdaParam, DcIdaResult>(
        ServiceDefenition.call.path,
        ServiceDefenition.call.requestSerialize,
        ServiceDefenition.call.responseDeserialize,
        dcIdaParam,
        this.createMetadata(),
        // TODO(henry): 개발 중 타임아웃 발생해서 주석처리함
        // this.createCallOptions(),
        (error?: ServiceError | null, value?: DcIdaResult) => {
          if (error) {
            reject(error);
            return;
          }

          if (value == null) {
            reject(GRPC_ACTION_NOT_FOUND_ERROR);
            return;
          }

          if (value.value == null) {
            reject(GRPC_RETURN_NOT_FOUND_ERROR);
            return;
          }
          if (value.value.$case !== 'dcIdaRunappResult') {
            reject(GRPC_RETURN_NOT_FOUND_ERROR);
            return;
          }

          resolve(value.value.dcIdaRunappResult);
        },
      );
    });
  }
  async call<
    ParamKey extends DcIdaParamKeys & keyof DcIdaParamUnionPick<ParamKey>,
    ResultKey extends DcIdaResultKeys & keyof DcIdaResultUnionPick<ResultKey>,
    ParamValue extends DcIdaParamUnionPickValue<ParamKey>,
    ResultValue extends DcIdaResultUnionPickValue<ResultKey>,
  >(paramKey: ParamKey, resultKey: ResultKey, paramValue: ParamValue): Promise<ResultValue> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        throw GRPC_CLIENT_NOT_FOUND_ERROR;
      }

      const paramObj = {
        $case: paramKey,
        [paramKey]: paramValue,
      } as unknown as DcIdaParamUnionPick<ParamKey>;

      const param: DcIdaParam = {
        value: paramObj,
      };

      this.client.makeUnaryRequest<DcIdaParam, DcIdaResult>(
        ServiceDefenition.call.path,
        ServiceDefenition.call.requestSerialize,
        ServiceDefenition.call.responseDeserialize,
        param,
        this.createMetadata(),
        // TODO(henry): 개발 중 타임아웃 발생해서 주석처리함
        // this.createCallOptions({ deadline: Date.now() + 1000 * 60 }),
        (error?: ServiceError | null, value?: DcIdaResult) => {
          if (error) {
            reject(error);
            return;
          }

          if (value == null) {
            reject(GRPC_ACTION_NOT_FOUND_ERROR);
            return;
          }

          const resultObj = value.value as DcIdaResultUnionPick<ResultKey>;
          if (resultObj == null) {
            reject(GRPC_RETURN_NOT_FOUND_ERROR);
            return;
          }

          resolve(resultObj[resultKey] as ResultValue);
        },
      );
    });
  }
}
