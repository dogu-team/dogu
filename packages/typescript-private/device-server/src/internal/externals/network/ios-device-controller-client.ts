// import {
//   Code,
//   ErrorResultError,
//   GRPC_ACTION_NOT_FOUND_ERROR,
//   GRPC_CLIENT_NOT_FOUND_ERROR,
//   GRPC_RETURN_NOT_FOUND_ERROR,
//   OneofUnionTypes,
//   Platform,
//   PrivateProtocol,
//   Serial,
// } from '@dogu-private/types';
// import { IosDeviceControllerServiceService } from '@dogu-private/types/protocol/generated/tsproto/inner/grpc/services/ios_device_controller_service';
// import { GrpcClientBase } from '@dogu-private/types/protocol/grpc/base';
// import { delay, Printable, stringifyError } from '@dogu-tech/common';
// import { ClientReadableStream, credentials, makeClientConstructor, ServiceError, status } from '@grpc/grpc-js';
// import { idcLogger } from '../../../logger/logger.instance';
// import { Zombieable, ZombieProps, ZombieWaiter } from '../../services/zombie/zombie-component';
// import { ZombieServiceInstance } from '../../services/zombie/zombie-service';
// import { IosDeviceControllerProcess } from '../cli/ios-device-controller';

// type DcIdcParam = PrivateProtocol.DcIdcParam;
// type DcIdcResult = PrivateProtocol.DcIdcResult;
// type DcIdcStartStreamingParam = PrivateProtocol.DcIdcStartStreamingParam;
// type DcIdcStartStreamingResult = PrivateProtocol.DcIdcStartStreamingResult;

// export type DcIdcParamKeys = OneofUnionTypes.UnionValueKeys<DcIdcParam>;
// export type DcIdcParamUnionPick<Key> = OneofUnionTypes.UnionValuePick<DcIdcParam, Key>;
// export type DcIdcParamUnionPickValue<Key extends keyof DcIdcParamUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<DcIdcParam, Key>;

// export type DcIdcResultKeys = OneofUnionTypes.UnionValueKeys<DcIdcResult>;
// export type DcIdcResultUnionPick<Key> = OneofUnionTypes.UnionValuePick<DcIdcResult, Key>;
// export type DcIdcResultUnionPickValue<Key extends keyof DcIdcResultUnionPick<Key>> = OneofUnionTypes.UnionValuePickInner<DcIdcResult, Key>;

// const ServiceDefenition = IosDeviceControllerServiceService;

// export class IosDeviceControllerGrpcClient extends GrpcClientBase implements Zombieable {
//   private zombieWaiter: ZombieWaiter;
//   constructor(public readonly serial: Serial, private readonly iosDeviceController: IosDeviceControllerProcess, timeoutSeconds: number) {
//     super('', timeoutSeconds);
//     this.zombieWaiter = ZombieServiceInstance.addComponent(this);
//   }

//   static async create(serial: Serial, iosDeviceController: IosDeviceControllerProcess, timeoutSeconds: number): Promise<IosDeviceControllerGrpcClient> {
//     const ret = new IosDeviceControllerGrpcClient(serial, iosDeviceController, timeoutSeconds);
//     ret.serverUrl = `127.0.0.1:${ret.iosDeviceController.port}`;
//     const constructor = makeClientConstructor(ServiceDefenition, 'IosDeviceControllerServiceService', GrpcClientBase.createClientOption());
//     ret.client = new constructor(ret.serverUrl, credentials.createInsecure());
//     await ret.zombieWaiter.waitUntilAlive();
//     return ret;
//   }

//   private async connect(): Promise<void> {
//     await this.waitForReady();
//   }

//   async call<
//     ParamKey extends DcIdcParamKeys & keyof DcIdcParamUnionPick<ParamKey>,
//     ResultKey extends DcIdcResultKeys & keyof DcIdcResultUnionPick<ResultKey>,
//     ParamValue extends DcIdcParamUnionPickValue<ParamKey>,
//     ResultValue extends DcIdcResultUnionPickValue<ResultKey>,
//   >(paramKey: ParamKey, resultKey: ResultKey, paramValue: ParamValue): Promise<ResultValue> {
//     return new Promise((resolve, reject) => {
//       if (!this.client) {
//         throw new ErrorResultError(Code.CODE_NETWORK_CONNECTION_FAILED, 'IosDeviceControllerGrpcClient not created. implementation error');
//       }
//       const paramObj = {
//         $case: paramKey,
//         [paramKey]: paramValue,
//       } as unknown as DcIdcParamUnionPick<ParamKey>;

//       const param: DcIdcParam = {
//         value: paramObj,
//       };

//       try {
//         this.client.makeUnaryRequest<DcIdcParam, DcIdcResult>(
//           ServiceDefenition.call.path,
//           ServiceDefenition.call.requestSerialize,
//           ServiceDefenition.call.responseDeserialize,
//           param,
//           this.createMetadata(),
//           this.createCallOptions(),
//           (error?: ServiceError | null, value?: DcIdcResult) => {
//             if (error) {
//               switch (error.code) {
//                 case status.DEADLINE_EXCEEDED:
//                   ZombieServiceInstance.notifyDie(this);
//                   break;
//                 default:
//                   break;
//               }
//               reject(error);
//               return;
//             }

//             if (value == null) {
//               reject(GRPC_ACTION_NOT_FOUND_ERROR);
//               return;
//             }

//             const resultObj = value.value as DcIdcResultUnionPick<ResultKey>;
//             if (resultObj == null) {
//               reject(GRPC_RETURN_NOT_FOUND_ERROR);
//               return;
//             }

//             resolve(resultObj[resultKey] as ResultValue);
//           },
//         );
//       } catch (e: unknown) {
//         ZombieServiceInstance.notifyDie(this);
//         reject(GRPC_ACTION_NOT_FOUND_ERROR);
//         return;
//       }
//     });
//   }
//   startStreaming(param: DcIdcStartStreamingParam): ClientReadableStream<DcIdcStartStreamingResult> {
//     if (!this.client) {
//       throw new ErrorResultError(Code.CODE_NETWORK_CONNECTION_FAILED, 'IosDeviceControllerGrpcClient not created. implementation error');
//     }

//     try {
//       const stream = this.client.makeServerStreamRequest(
//         ServiceDefenition.startStreaming.path,
//         ServiceDefenition.startStreaming.requestSerialize,
//         ServiceDefenition.startStreaming.responseDeserialize,
//         param,
//         this.createMetadata(),
//       );
//       stream.on('error', (error) => {
//         ZombieServiceInstance.notifyDie(this);
//         idcLogger.error(`IosDeviceControllerGrpcClient.startStreaming error:  ${stringifyError(error)}`);
//       });
//       return stream;
//     } catch (e: unknown) {
//       ZombieServiceInstance.notifyDie(this);
//       throw GRPC_CLIENT_NOT_FOUND_ERROR;
//     }
//   }

//   // zombie
//   get parent(): Zombieable | null {
//     return this.iosDeviceController;
//   }
//   get name(): string {
//     return 'IosDeviceControllerGrpcClient';
//   }
//   get platform(): Platform {
//     return Platform.PLATFORM_IOS;
//   }
//   get props(): ZombieProps {
//     return { destServer: this.serverUrl };
//   }
//   get printable(): Printable {
//     return idcLogger;
//   }
//   async revive(): Promise<void> {
//     await delay(1000);
//     await this.connect();
//   }
//   onDie(): void {
//     this.close();
//   }

//   private close(): void {
//     if (this.client) {
//       this.client.close();
//       this.client = null;
//     }
//   }
// }
