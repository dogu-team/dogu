import {
  Code,
  ErrorResultError,
  GRPC_ACTION_NOT_FOUND_ERROR,
  GRPC_CLIENT_NOT_FOUND_ERROR,
  GRPC_RETURN_NOT_FOUND_ERROR,
  OneofUnionTypes,
  Platform,
  PrivateProtocol,
  Serial,
} from '@dogu-private/types';
import { GoDeviceControllerServiceService } from '@dogu-private/types/protocol/generated/tsproto/inner/grpc/services/go_device_controller_service';
import { GrpcClientBase } from '@dogu-private/types/protocol/grpc/base';
import { delay, Printable, stringify } from '@dogu-tech/common';
import { ClientReadableStream, credentials, makeClientConstructor, ServiceError, status } from '@grpc/grpc-js';
import { config } from '../../config';

import { Zombieable, ZombieProps, ZombieQueriable } from '../../services/zombie/zombie-component';
import { ZombieServiceInstance } from '../../services/zombie/zombie-service';
import { GoDeviceControllerProcess } from '../cli/go-device-controller';

type DcGdcDeviceContext = PrivateProtocol.DcGdcDeviceContext;
type DcGdcParam = PrivateProtocol.DcGdcParam;
type DcGdcResult = PrivateProtocol.DcGdcResult;
type DcGdcStartStreamingParam = PrivateProtocol.DcGdcStartStreamingParam;
type DcGdcStartStreamingResult = PrivateProtocol.DcGdcStartStreamingResult;

export type DcGdcParamKeys = OneofUnionTypes.UnionValueKeys<DcGdcParam>;
export type DcGdcParamUnionPick<Key> = OneofUnionTypes.UnionValuePick<DcGdcParam, Key>;
export type DcGdcParamUnionPickValue<Key extends keyof DcGdcParamUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<DcGdcParam, Key>;

export type DcGdcResultKeys = OneofUnionTypes.UnionValueKeys<DcGdcResult>;
export type DcGdcResultUnionPick<Key> = OneofUnionTypes.UnionValuePick<DcGdcResult, Key>;
export type DcGdcResultUnionPickValue<Key extends keyof DcGdcResultUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<DcGdcResult, Key>;

type DeviceMap = Map<string, DcGdcDeviceContext>;

const ServiceDefenition = GoDeviceControllerServiceService;

export class GoDeviceControllerGrpcClient extends GrpcClientBase implements Zombieable {
  private zombieWaiter: ZombieQueriable;
  static _deviceMap = new Map<string, DcGdcDeviceContext>(); // When debugging go-device-controller. The entire device list exists globally and is for synchronization..
  _deviceMap = new Map<string, DcGdcDeviceContext>();

  constructor(
    public readonly platform: Platform,
    public readonly goDeviceController: GoDeviceControllerProcess,
    serverUrl: string,
    timeoutSeconds: number,
  ) {
    super(serverUrl, timeoutSeconds);
    this.zombieWaiter = ZombieServiceInstance.addComponent(this);
  }
  private get deviceMap(): DeviceMap {
    if (config.externalGoDeviceController.use) {
      return GoDeviceControllerGrpcClient._deviceMap;
    }
    return this._deviceMap;
  }

  static async create(platform: Platform, goDeviceController: GoDeviceControllerProcess, serverUrl: string, timeoutSeconds: number): Promise<GoDeviceControllerGrpcClient> {
    const ret = new GoDeviceControllerGrpcClient(platform, goDeviceController, serverUrl, timeoutSeconds);
    await ret.zombieWaiter.waitUntilAlive();
    return ret;
  }

  async connect(): Promise<void> {
    const constructor = makeClientConstructor(ServiceDefenition, 'GoDeviceControllerServiceService', {});
    this.client = new constructor(this.serverUrl, credentials.createInsecure());
    await this.waitForReady();
  }

  async call<
    ParamKey extends DcGdcParamKeys & keyof DcGdcParamUnionPick<ParamKey>,
    ResultKey extends DcGdcResultKeys & keyof DcGdcResultUnionPick<ResultKey>,
    ParamValue extends DcGdcParamUnionPickValue<ParamKey>,
    ResultValue extends DcGdcResultUnionPickValue<ResultKey>,
  >(paramKey: ParamKey, resultKey: ResultKey, paramValue: ParamValue): Promise<ResultValue> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        ZombieServiceInstance.notifyDie(this, 'client empty');
        throw new ErrorResultError(Code.CODE_NETWORK_CONNECTION_CLOSED, 'GoDeviceControllerGrpcClient not connected');
      }

      const paramObj = {
        $case: paramKey,
        [paramKey]: paramValue,
      } as unknown as DcGdcParamUnionPick<ParamKey>;

      const param: DcGdcParam = {
        value: paramObj,
      };

      this.client.makeUnaryRequest<DcGdcParam, DcGdcResult>(
        ServiceDefenition.call.path,
        ServiceDefenition.call.requestSerialize,
        ServiceDefenition.call.responseDeserialize,
        param,
        this.createMetadata(),
        this.createCallOptions(),
        (error: ServiceError | null, value?: DcGdcResult): void => {
          if (error != null) {
            switch (error.code) {
              case status.DEADLINE_EXCEEDED:
                ZombieServiceInstance.notifyDie(this, 'DEADLINE_EXCEEDED');
                break;
              default:
                break;
            }
            reject(error);
            return;
          }

          if (value == null) {
            reject(GRPC_ACTION_NOT_FOUND_ERROR);
            return;
          }

          const resultObj = value.value as DcGdcResultUnionPick<ResultKey>;
          if (resultObj == null) {
            reject(GRPC_RETURN_NOT_FOUND_ERROR);
            return;
          }

          resolve(resultObj[resultKey] as ResultValue);
        },
      );
    });
  }

  startStreaming(param: DcGdcStartStreamingParam): ClientReadableStream<DcGdcStartStreamingResult> {
    if (!this.client) {
      throw new ErrorResultError(Code.CODE_NETWORK_CONNECTION_FAILED, 'GoDeviceControllerGrpcClient not created. implementation error');
    }

    try {
      const stream = this.client.makeServerStreamRequest(
        ServiceDefenition.startStreaming.path,
        ServiceDefenition.startStreaming.requestSerialize,
        ServiceDefenition.startStreaming.responseDeserialize,
        param,
        this.createMetadata(),
      );
      stream.on('error', (error) => {
        ZombieServiceInstance.notifyDie(this, 'stream error');
        this.printable.error?.(`GoDeviceControllerGrpcClient.startStreaming error:  ${stringify(error)}`);
      });
      return stream;
    } catch (e: unknown) {
      ZombieServiceInstance.notifyDie(this, `startStreaming error: ${stringify(e)}`);
      throw GRPC_CLIENT_NOT_FOUND_ERROR;
    }
  }

  async deviceConnected(serial: Serial, context: DcGdcDeviceContext): Promise<void> {
    this.deviceMap.set(serial, context);

    await this.notifyDevicelist();
  }

  async deviceDisconnected(serial: Serial): Promise<void> {
    if (this.deviceMap.has(serial)) {
      this.deviceMap.delete(serial);
    }

    await this.notifyDevicelist();
  }

  async notifyDevicelist(): Promise<void> {
    if (!this.client) {
      ZombieServiceInstance.notifyDie(this, 'client empty');
      this.printable.error('GoDeviceControllerGrpcClient not connected');
    }
    await this.call('dcGdcUpdateDevicelistParam', 'dcGdcUpdateDevicelistResult', {
      devices: Array.from(this.deviceMap.values()),
    }).catch((e) => {
      ZombieServiceInstance.notifyDie(this, `notifyDevicelist error: ${stringify(e)}`);
      this.printable.error(`GoDeviceControllerGrpcClient.notifyDevicelist error: ${stringify(e)}`);
    });
  }

  // Zombie
  get name(): string {
    return `GoDeviceControllerGrpcClient`;
  }
  get props(): ZombieProps {
    return { destServer: this.serverUrl };
  }

  get serial(): string {
    return '';
  }
  get printable(): Printable {
    return this.goDeviceController.printable;
  }

  async revive(): Promise<void> {
    await this.connect();
  }

  async afterRevive(): Promise<void> {
    await this.notifyDevicelist();
  }
  async update(): Promise<void> {
    await this.notifyDevicelist();
    await delay(5000);
  }

  onDie(reason: string): void {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
  }
}
