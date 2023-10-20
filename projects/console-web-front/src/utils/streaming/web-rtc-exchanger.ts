import { DeviceStreamingOffer } from '@dogu-private/console';
import {
  DefaultScreenCaptureOption,
  DeviceId,
  LiveSessionId,
  OrganizationId,
  Platform,
  Serial,
  StreamingOption,
} from '@dogu-private/types';
import { sdpExt } from '@dogu-private/webrtc';
import { PromiseOrValue, transformAndValidate } from '@dogu-tech/common';
import { StreamingAnswerDto } from '@dogu-tech/device-client-common';

import { config } from '../../../config';
import { StreamingError, StreamingErrorType } from '../../types/streaming';
import { WebSocketUrlResolver } from '../web-socket';

export interface WebRtcExchanger {
  startExchange(
    organizationId: OrganizationId,
    deviceId: DeviceId,
    liveSessionId: LiveSessionId | null,
    serial: Serial,
    peerConnection: RTCPeerConnection,
    platform: Platform,
    options?: StreamingOption,
    onError?: (error: StreamingError) => PromiseOrValue<void>,
  ): void;
}

export class WebRtcTrickleExchanger implements WebRtcExchanger {
  private webSocket: WebSocket | null = null;
  private isRemovePeerDescriptionSet = false;
  private candidatesBuffer: RTCIceCandidateInit[] = [];

  startExchange(
    organizationId: OrganizationId,
    deviceId: DeviceId,
    liveSessionId: LiveSessionId | null,
    serial: Serial,
    peerConnection: RTCPeerConnection,
    platform: Platform,
    option?: StreamingOption,
    onError?: (error: StreamingError) => PromiseOrValue<void>,
  ): void {
    this.startExchangeInternal(
      organizationId,
      deviceId,
      liveSessionId,
      serial,
      peerConnection,
      platform,
      option,
      onError,
    ).catch(async (error) => {
      if (onError !== undefined) {
        await onError(error);
      }
      console.debug('startExchangeInternal error', error);
    });
  }

  private async startExchangeInternal(
    organizationId: OrganizationId,
    deviceId: DeviceId,
    liveSessionId: LiveSessionId | null,
    serial: Serial,
    peerConnection: RTCPeerConnection,
    platform: Platform,
    option?: StreamingOption,
    onError?: (error: StreamingError) => PromiseOrValue<void>,
  ): Promise<void> {
    console.debug(`${this.constructor.name} startExchangeInternal`, { option });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.debug(`${this.constructor.name} local`, {
      localDescription: peerConnection.localDescription,
    });

    const url = new WebSocketUrlResolver().resolve(
      `/ws/device-streaming-trickle-exchanger?organizationId=${organizationId}&deviceId=${deviceId}&liveSessionId=${
        liveSessionId ?? ''
      }`,
    );
    const webSocket = new WebSocket(url);
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
    this.webSocket = webSocket;

    webSocket.addEventListener('open', (event) => {
      console.debug(`${this.constructor.name} open`, event);

      if (peerConnection.localDescription === null) {
        throw new Error('no local session');
      }

      const peerDescription = sdpExt.convertSdpFromTsToProto(peerConnection.localDescription);
      const param: DeviceStreamingOffer = {
        organizationId,
        deviceId,
        serial,
        value: {
          $case: 'startStreaming',
          startStreaming: {
            peerDescription,
            option: option ?? {
              screen: DefaultScreenCaptureOption(),
            },
            turnServerUrl: config.turnServer.url,
            turnServerUsername: config.turnServer.userName,
            turnServerPassword: config.turnServer.password,
            platform: platform,
          },
        },
      };
      const paramData = JSON.stringify(param);
      webSocket.send(paramData);
    });

    webSocket.addEventListener('close', (event) => {
      console.debug(`${this.constructor.name} close`, event);
      onError?.(new StreamingError(StreamingErrorType.WS_DISCONNECT, `WebSocket close reason: ${event.reason}`));
    });
    webSocket.addEventListener('error', (event) => {
      console.debug(`${this.constructor.name} error`, event);
      onError?.(new StreamingError(StreamingErrorType.WS_DISCONNECT, `WebSocket error : ${event}`));
    });
    webSocket.addEventListener('message', (event) => {
      console.debug(`${this.constructor.name} message`, event);
      this.onMessage(peerConnection, event).catch((error) => {
        if (onError !== undefined) {
          onError(error);
        }
        console.debug('onMessage error', error);
      });
    });

    if (peerConnection.signalingState === 'closed') {
      onError?.(new StreamingError(StreamingErrorType.WS_DISCONNECT, `RTC peer signalingState closed`));
    }
  }

  private async processAnswer(peerConnection: RTCPeerConnection, answerDto: StreamingAnswerDto): Promise<void> {
    const { value } = answerDto;
    if (value === undefined) {
      throw new Error(`invalid message ${JSON.stringify(answerDto)}`);
    }
    const { $case } = value;
    if ($case === 'errorResult') {
      const { errorResult } = value;
      const { code, message, details } = errorResult;
      throw new Error(`error: ${code} ${message} ${details}`);
    } else if ($case === 'peerDescription') {
      const { peerDescription } = value;
      const answer = sdpExt.convertSdpFromProtoToTs(peerDescription);
      await peerConnection.setRemoteDescription(answer);
      console.debug('remote peerDescription', peerDescription);
      this.isRemovePeerDescriptionSet = true;
      await this.flushCandidates(peerConnection);
    } else if ($case === 'iceCandidate') {
      const { iceCandidate } = value;
      await this.addCandidate(peerConnection, iceCandidate);
    } else {
      throw new Error(`invalid message ${JSON.stringify(answerDto)}`);
    }
  }

  private async onMessage(peerConnection: RTCPeerConnection, event: MessageEvent): Promise<void> {
    const result = await transformAndValidate(StreamingAnswerDto, JSON.parse(event.data));
    await this.processAnswer(peerConnection, result);
  }

  private async addCandidate(peerConnection: RTCPeerConnection, iceCandidate: RTCIceCandidateInit): Promise<void> {
    if (iceCandidate.candidate === null) {
      console.warn('remote iceCandidate is null', iceCandidate);
      return;
    }
    this.candidatesBuffer.push(iceCandidate);
    await this.flushCandidates(peerConnection);
  }

  private async flushCandidates(peerConnection: RTCPeerConnection): Promise<void> {
    if (this.isRemovePeerDescriptionSet === false) {
      return;
    }
    for (const candidate of this.candidatesBuffer) {
      if (!candidate.sdpMid) {
        /**
         * @note sdpMid is required for firefox
         */
        candidate.sdpMid = '0';
      }
      console.debug('remote iceCandidate added', candidate);
      await peerConnection.addIceCandidate(candidate);
    }
    console.debug('remote iceCandidate flushCandidates');
    this.candidatesBuffer = [];
  }
}

export class WebRtcExchangerFactory {
  static createByPlatform(platform: Platform): WebRtcExchanger {
    return new WebRtcTrickleExchanger();
  }
}
