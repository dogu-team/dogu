// (Deprecated) iOS is using pion-streaming-service
// import {
//   Code,
//   DefaultScreenCaptureOption,
//   ErrorResult,
//   ErrorResultError,
//   PrivateProtocol,
//   ProtoRTCPeerDescription,
//   ScreenCaptureOption,
//   ScreenRecordOption,
//   Serial,
//   StreamingAnswer,
// } from '@dogu-private/types';
// import { stringify } from '@dogu-tech/common';
// import { StreamingOfferDto } from '@dogu-tech/device-client-common';
// import { Observable } from 'rxjs';
// import { idcLogger } from '../../../logger/logger.instance';
// import { IosDeviceControllerGrpcClient } from '../../externals/network/ios-device-controller-client';
// import { DeviceAgentService } from '../device-agent/device-agent-service';
// import { StreamingService } from './streaming-service';

// type DcIdcStartStreamingParam = PrivateProtocol.DcIdcStartStreamingParam;
// type DcIdcStartStreamingResult = PrivateProtocol.DcIdcStartStreamingResult;
// type DeviceControl = PrivateProtocol.DeviceControl;

// export class IosStreamingService implements StreamingService {
//   static async create(iosDeviceControllerClient: IosDeviceControllerGrpcClient): Promise<IosStreamingService> {
//     await Promise.resolve();
//     return new IosStreamingService(iosDeviceControllerClient);
//   }

//   private constructor(private readonly iosDeviceControllerClient: IosDeviceControllerGrpcClient) {}

//   startStreaming(serial: Serial, dto: StreamingOfferDto): ProtoRTCPeerDescription {
//     throw new Error('Method not implemented.');
//   }

//   startStreamingWithTrickle(serial: Serial, dto: StreamingOfferDto): Observable<StreamingAnswer> {
//     idcLogger.verbose(`${this.constructor.name}.startStreamingWithTrickle`, {
//       serial,
//       dto,
//     });
//     const { value } = dto;
//     const { $case } = value;
//     if ($case === 'startStreaming') {
//       const { startStreaming } = value;
//       const { peerDescription, option } = startStreaming;
//       const mergedCaptureOption: ScreenCaptureOption = { ...DefaultScreenCaptureOption(), ...option.screen };
//       return new Observable((subscriber) => {
//         const param: DcIdcStartStreamingParam = {
//           offer: {
//             serial,
//             value: {
//               $case: 'startStreaming',
//               startStreaming: {
//                 peerDescription,
//                 option: { screen: mergedCaptureOption },
//                 turnServerUrl: startStreaming.turnServerUrl,
//                 turnServerUsername: startStreaming.turnServerUsername,
//                 turnServerPassword: startStreaming.turnServerPassword,
//                 platform: startStreaming.platform,
//               },
//             },
//           },
//         };
//         const stream = this.iosDeviceControllerClient.startStreaming(param);

//         let errorOccurred: Error | null = null;
//         stream.on('error', (error) => {
//           idcLogger.error('IosStreamingService.startStreamingWithTrickle.onError', { error });
//           errorOccurred = error;
//         });
//         stream.on('close', () => {
//           idcLogger.verbose('IosStreamingService.startStreamingWithTrickle.onClose');
//           if (errorOccurred != null) {
//             subscriber.error(errorOccurred);
//           } else {
//             subscriber.complete();
//           }
//         });

//         stream.on('data', (result: DcIdcStartStreamingResult) => {
//           idcLogger.verbose('IosStreamingService.startStreaming.onData', { result });
//           const { answer } = result;
//           if (answer === undefined) {
//             throw new Error('answer is undefined');
//           }
//           subscriber.next(answer);
//         });
//       });
//     } else if ($case === 'iceCandidate') {
//       throw new Error('IosStreamingService.startStreamingWithTrickle.iceCandidate is not supported');
//     } else {
//       throw new Error(`Unexpected $case: ${stringify(dto)}`);
//     }
//   }

//   async startRecord(serial: string, option: ScreenRecordOption): Promise<ErrorResult> {
//     idcLogger.verbose('IosStreamingService.startRecord');

//     const mergedCaptureOption: ScreenCaptureOption = { ...DefaultScreenCaptureOption(), ...option.screen };
//     const result = await this.iosDeviceControllerClient.call('dcIdcStartScreenRecordParam', 'dcIdcStartScreenRecordResult', {
//       serial: serial,
//       option: {
//         screen: mergedCaptureOption,
//         filePath: option.filePath,
//       },
//     });
//     if (!result.error) {
//       throw new ErrorResultError(Code.CODE_STRING_EMPTY, 'startRecord response is null');
//     }

//     return result.error;
//   }

//   async stopRecord(serial: string): Promise<ErrorResult> {
//     idcLogger.verbose('IosStreamingService.stopRecord');
//     const result = await this.iosDeviceControllerClient.call('dcIdcStopScreenRecordParam', 'dcIdcStopScreenRecordResult', {
//       serial: serial,
//     });
//     if (!result.error) {
//       throw new ErrorResultError(Code.CODE_STRING_EMPTY, 'stopRecord response is null');
//     }

//     return result.error;
//   }

//   stopStreaming(serial: Serial): void {
//     throw new Error('Method not implemented.');
//   }

//   deviceConnected(serial: Serial, deviceAgent: DeviceAgentService): void {
//     throw new Error('Method not implemented.');
//   }

//   deviceDisconnected(serial: Serial): void {
//     throw new Error('Method not implemented.');
//   }
// }
