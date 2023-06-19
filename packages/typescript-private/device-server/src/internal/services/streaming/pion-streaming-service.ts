import {
  Code,
  DefaultScreenCaptureOption,
  ErrorResult,
  ErrorResultError,
  Platform,
  PrivateProtocol,
  ProtoRTCPeerDescription,
  ScreenCaptureOption,
  ScreenRecordOption,
  Serial,
  StreamingAnswer,
} from '@dogu-private/types';
import { stringify, stringifyError } from '@dogu-tech/common';
import { StreamingOfferDto } from '@dogu-tech/device-client-common';
import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import { Observable } from 'rxjs';
import { DcGdcDeviceContext } from '../../../../../types/src/protocol/generated';
import { gdcLogger } from '../../../logger/logger.instance';
import { makeWebmSeekable } from '../../externals/cli/ffmpeg';
import { GoDeviceControllerProcess } from '../../externals/cli/go-device-controller';
import { GoDeviceControllerGrpcClient } from '../../externals/network/go-device-controller-client';
import { delay } from '../../util/delay';
import { getOriginFilePathFromTmp, makeTmpFilePath } from '../../util/files';
import { StreamingService } from './streaming-service';

type DcGdcStartStreamingParam = PrivateProtocol.DcGdcStartStreamingParam;
type DcGdcStartStreamingResult = PrivateProtocol.DcGdcStartStreamingResult;

export class PionStreamingService implements StreamingService {
  private constructor(private readonly platform: Platform, private readonly grpcClient: GoDeviceControllerGrpcClient) {}
  private port: number | null = null;

  static async create(platform: Platform, deviceServerPort: number): Promise<PionStreamingService> {
    const gdc = await GoDeviceControllerProcess.create(platform, deviceServerPort);
    const gdcClient = await GoDeviceControllerGrpcClient.create(platform, gdc, `127.0.0.1:${gdc.port}`, 60);
    const ret = new PionStreamingService(platform, gdcClient);
    return ret;
  }

  startStreaming(serial: Serial, offer: StreamingOfferDto): ProtoRTCPeerDescription {
    throw new Error('Method not supported.');
  }

  async startStreamingWithTrickle(serial: string, offer: StreamingOfferDto): Promise<Observable<StreamingAnswer>> {
    gdcLogger.verbose(`${this.constructor.name}.startStreamingWithTrickle`, {
      serial,
      offer,
    });

    const { value } = offer;
    const { $case } = value;
    if ($case === 'startStreaming') {
      const { startStreaming } = value;
      const { peerDescription, option } = startStreaming;
      const screenOption = { ...option.screen } as { [key: string]: unknown };
      // Object.keys(screenOption).forEach((key) => (screenOption[key] === undefined ? delete screenOption[key] : {}));
      const mergedCaptureOption: ScreenCaptureOption = lodash.merge(DefaultScreenCaptureOption(), screenOption as unknown as ScreenCaptureOption);
      return new Observable((subscriber) => {
        const param: DcGdcStartStreamingParam = {
          offer: {
            serial,
            value: {
              $case: 'startStreaming',
              startStreaming: {
                peerDescription,
                option: { screen: mergedCaptureOption },
                turnServerUrl: startStreaming.turnServerUrl,
                turnServerUsername: startStreaming.turnServerUsername,
                turnServerPassword: startStreaming.turnServerPassword,
                platform: startStreaming.platform,
              },
            },
          },
        };
        const stream = this.grpcClient.startStreaming(param);

        let errorOccurred: Error | null = null;
        stream.on('error', (error) => {
          gdcLogger.error('PionStreamingService.startStreamingWithTrickle.onError', { error });
          errorOccurred = error;
        });
        stream.on('close', () => {
          gdcLogger.verbose('PionStreamingService.startStreamingWithTrickle.onClose');
          if (errorOccurred != null) {
            subscriber.error(errorOccurred);
          } else {
            subscriber.complete();
          }
        });

        stream.on('data', (result: DcGdcStartStreamingResult) => {
          gdcLogger.verbose('PionStreamingService.startStreaming.onData', { result });
          const { answer } = result;
          if (answer === undefined) {
            throw new Error('answer is undefined');
          }
          subscriber.next(answer);
        });
      });
    } else if ($case === 'iceCandidate') {
      throw new Error('PionStreamingService.startStreamingWithTrickle.iceCandidate is not supported');
    } else {
      throw new Error(`Unexpected $case: ${stringify(offer)}`);
    }
    await delay(0);
  }

  stopStreaming(serial: Serial): void {
    gdcLogger.warn('PionStreamingService.stopStreaming is not implemented yet');
  }

  async startRecord(serial: string, option: ScreenRecordOption): Promise<ErrorResult> {
    const tmpFilePath = makeTmpFilePath(option.filePath);

    const mergedCaptureOption: ScreenCaptureOption = lodash.merge(DefaultScreenCaptureOption(), option.screen);
    const result = await this.grpcClient
      .call('dcGdcStartScreenRecordParam', 'dcGdcStartScreenRecordResult', {
        serial: serial,
        option: {
          screen: mergedCaptureOption,
          filePath: tmpFilePath,
          etcParam: option.etcParam ?? '',
        },
      })
      .catch((e) => {
        throw new ErrorResultError(Code.CODE_NETWORK_CONNECTION_ABORTED, `PionStreamingService.stopStreaming error: ${stringifyError(e)}`);
      });
    if (!result.error) {
      throw new ErrorResultError(Code.CODE_STRING_EMPTY, 'startRecord response is null');
    }
    return result.error;
  }

  async stopRecord(serial: string): Promise<ErrorResult> {
    const result = await this.grpcClient.call('dcGdcStopScreenRecordParam', 'dcGdcStopScreenRecordResult', { serial: serial }).catch((e) => {
      throw new ErrorResultError(Code.CODE_NETWORK_CONNECTION_ABORTED, `PionStreamingService.stopStreaming error: ${stringifyError(e)}`);
    });
    if (!result.error) {
      throw new ErrorResultError(Code.CODE_STRING_EMPTY, 'startRecord response is null');
    }
    await postProcessRecord(result.filePath);
    await fs.promises.rename(result.filePath, getOriginFilePathFromTmp(result.filePath));

    return result.error;
  }

  async deviceConnected(serial: Serial, context: DcGdcDeviceContext): Promise<void> {
    await this.grpcClient.deviceConnected(serial, context);
  }

  async deviceDisconnected(serial: Serial): Promise<void> {
    await this.grpcClient.deviceDisconnected(serial);
  }
}

async function postProcessRecord(filePath: string) {
  const ext = path.extname(filePath);
  if (ext !== '.webm') {
    return;
  }

  const convertedFilePath = path.resolve(path.dirname(filePath), `seekable_${path.basename(filePath)}`);
  await makeWebmSeekable(filePath, convertedFilePath, gdcLogger);
  gdcLogger.info('startRecording postProcessRecord completed', { filePath, convertedFilePath });
  const fileTmpPath = `${filePath}.tmp`;
  await fs.promises.rename(filePath, fileTmpPath);
  await fs.promises.rename(convertedFilePath, filePath);
  await fs.promises.rm(fileTmpPath, { force: true });
}
