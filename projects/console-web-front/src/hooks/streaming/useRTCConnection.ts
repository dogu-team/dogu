import { DeviceBase } from '@dogu-private/console';
import { LiveSessionId, OrganizationId, PrivateProtocol, StreamingOption } from '@dogu-private/types';
import { DeviceRTCCaller } from '@dogu-private/webrtc';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { checkDeviceStateAsync } from 'src/api/device';
// import useStreamingOptionStore from 'src/stores/streaming-option';
import { StreamingError, StreamingErrorType } from 'src/types/streaming';
import { config } from '../../../config';
import useEventStore from '../../stores/events';
import { createDataChannel } from '../../utils/streaming/web-rtc';
import { WebRtcExchangerFactory } from '../../utils/streaming/web-rtc-exchanger';

type DataChannelLabel = PrivateProtocol.DataChannelLabel;

type Option = {
  device?: DeviceBase;
  pid?: number;
  isCloudDevice?: boolean;
};

const useRTCConnection = ({ device, pid, isCloudDevice }: Option, sendThrottleMs: number) => {
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;
  // const { fps, resolution } = useStreamingOptionStore((state) => state.option);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | undefined>();
  const deviceRTCCallerRef = useRef<DeviceRTCCaller | undefined>();
  const [haConnectionError, setHAConnectionError] = useState<StreamingError>();
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fireEvent = useEventStore((state) => state.fireEvent);

  const cleanUp = useCallback(() => {
    fireEvent('onStreamingClosed', device?.deviceId);
    console.debug('deviceRTCCaller', deviceRTCCallerRef?.current);
    deviceRTCCallerRef.current?.channel?.close();
    console.debug(`close connection data ${device?.deviceId}`);

    console.debug('peer', peerConnectionRef.current);
    peerConnectionRef.current?.close();
    console.debug(`close connection ${device?.deviceId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device?.deviceId]);

  useEffect(() => {
    const unsub = useEventStore.subscribe(({ eventName }) => {
      if (eventName === 'onCloudHeartbeatSocketClosed') {
        setHAConnectionError(new StreamingError(StreamingErrorType.CONNECTION_REFUSED, 'Session has been expired'));
        cleanUp();
      }
    });

    return unsub;
  }, [cleanUp]);

  useEffect(() => {
    if (device?.displayError) {
      setHAConnectionError(new StreamingError(StreamingErrorType.DEVICE_ERROR, device.displayError));
      cleanUp();
    }
  }, [device?.displayError, cleanUp]);

  useEffect(() => {
    const checkDeviceState = async () => {
      if (!device) {
        return;
      }

      try {
        await checkDeviceStateAsync(organizationId, device.deviceId);
      } catch (e) {
        if (e instanceof AxiosError) {
          console.debug('checkDeviceState error', e.response?.data);
          setHAConnectionError(new StreamingError(StreamingErrorType.HA_DISCONNECT, e.response?.data));
          cleanUp();
        }
      }
    };

    const t = setInterval(async () => await checkDeviceState(), 3000);
    timer.current = t;

    return () => {
      clearInterval(timer.current ?? undefined);
    };
  }, [device, organizationId, cleanUp]);

  useEffect(() => {
    if (haConnectionError && timer.current) {
      clearInterval(timer.current ?? undefined);
    }
  }, [haConnectionError, timer]);

  useEffect(() => {
    const handleResize = () => {
      setLoading(false);
    };

    videoRef.current?.addEventListener('resize', handleResize);

    return () => {
      videoRef.current?.removeEventListener('resize', handleResize);
    };
  }, []);

  const initializeConnection = useCallback(
    (pid?: number) => {
      if (!device) {
        return;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302',
              'stun:stun2.l.google.com:19302',
              'stun:stun3.l.google.com:19302',
              'stun:stun4.l.google.com:19302',
            ],
          },
          {
            urls: config.turnServer.url,
            username: config.turnServer.userName,
            credential: config.turnServer.password,
            credentialType: config.turnServer.credentialType,
          },
        ],
      });

      pc.oniceconnectionstatechange = (e) => {
        console.debug('ice state', pc.iceConnectionState);
      };
      pc.onconnectionstatechange = (e) => {
        console.debug('connection state', pc.connectionState);
      };
      pc.onsignalingstatechange = (e) => {
        console.debug('signaling state', pc.signalingState);
      };
      pc.onicecandidate = (e) => {
        console.debug('onicecandidate', e.candidate);
      };

      console.debug('init connection state', pc.connectionState);
      console.debug('init iceconection state', pc.iceConnectionState);
      console.debug('init signaling state', pc.signalingState);

      pc.addTransceiver('video', { direction: 'recvonly' });

      pc.ontrack = (e) => {
        if (videoRef.current) {
          videoRef.current.srcObject = e.streams[0];
        }
      };

      const dcLabel: DataChannelLabel = {
        name: '',
        protocol: {
          $case: 'default',
          default: {},
        },
      };
      const dc = createDataChannel(pc, dcLabel, { ordered: true, maxRetransmits: 0 });

      const streamingOption: StreamingOption = {
        screen: {
          maxFps: 60,
          pid,
          maxResolution: 720,
        },
      };

      if (device) {
        const { platform, serial } = device;
        const webRtcExchanger = WebRtcExchangerFactory.createByPlatform(platform);
        webRtcExchanger.startExchange(
          organizationId,
          device.deviceId,
          isCloudDevice ? (router.query.sessionId as LiveSessionId) : null,
          serial,
          pc,
          device.platform,
          streamingOption,
          (error) => {
            console.debug('startExchange error', error);
            if (isVideoShowing(videoRef.current)) {
              console.debug('rtc in progress. so ignore ws error', error);
              return;
            }
            setHAConnectionError(error);
            cleanUp();
          },
        );

        const caller = new DeviceRTCCaller(device.deviceId, dc);
        caller.setSendThrottleMs(sendThrottleMs);
        deviceRTCCallerRef.current = caller;
      }

      peerConnectionRef.current = pc;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cleanUp, device?.deviceId, isCloudDevice, router.query.sessionId, sendThrottleMs],
  );

  useEffect(() => {
    if (loading && !haConnectionError) {
      const timer = setInterval(() => {
        if (pid) {
          console.log('retry initialize connection');
          initializeConnection(pid);
        }
      }, 15000);

      return () => {
        clearInterval(timer);
      };
    }

    return () => {
      if (!loading) {
        return;
      }

      console.log('clear initialize connection');

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      deviceRTCCallerRef.current = undefined;
      peerConnectionRef.current = undefined;
      setHAConnectionError(undefined);
      cleanUp();
    };
  }, [loading, pid, haConnectionError, cleanUp, initializeConnection]);

  useEffect(() => {
    console.log('pid', pid);

    console.log('initialize connection');
    initializeConnection(pid);

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      deviceRTCCallerRef.current = undefined;
      peerConnectionRef.current = undefined;
      setHAConnectionError(undefined);
      setLoading(true);
      cleanUp();
    };
  }, [pid, cleanUp, initializeConnection]);

  useEffect(() => {
    return () => {
      cleanUp();
    };
  }, [cleanUp]);

  return { loading, peerConnectionRef, deviceRTCCallerRef, videoRef, error: haConnectionError };
};

function isVideoShowing(elem: HTMLVideoElement | null): boolean {
  if (!elem) {
    return false;
  }
  if (0 < elem.videoWidth && 0 < elem.videoHeight) {
    return true;
  }
  return false;
}

export default useRTCConnection;
