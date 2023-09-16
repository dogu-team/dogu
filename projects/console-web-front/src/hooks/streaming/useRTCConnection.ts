import { DeviceBase } from '@dogu-private/console';
import { OrganizationId, PrivateProtocol, StreamingOption } from '@dogu-private/types';
import { DeviceRTCCaller } from '@dogu-private/webrtc';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { checkDeviceStateAsync } from 'src/api/device';
import useStreamingOptionStore from 'src/stores/streaming-option';
import { StreamingError, StreamingErrorType } from 'src/types/streaming';
import { config } from '../../../config';
import { createDataChannel } from '../../utils/streaming/web-rtc';
import { WebRtcExchangerFactory } from '../../utils/streaming/web-rtc-exchanger';

type DataChannelLabel = PrivateProtocol.DataChannelLabel;

const useRTCConnection = (device: DeviceBase | undefined, sendThrottleMs: number) => {
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;
  const { fps, resolution } = useStreamingOptionStore((state) => state.option);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
  const [deviceRTCCaller, setDeviceRTCCaller] = useState<DeviceRTCCaller>();
  const [haConnectionError, setHAConnectionError] = useState<StreamingError>();
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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
        }
      }
    };

    const t = setInterval(async () => await checkDeviceState(), 3000);
    timer.current = t;

    return () => {
      clearInterval(timer.current ?? undefined);
    };
  }, [device, organizationId]);

  useEffect(() => {
    if (haConnectionError && timer) {
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

  useEffect(() => {
    if (!device) {
      console.error('No device');
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
      // const videoElem = document.getElementById(deviceId) as HTMLVideoElement;
      if (videoRef.current) {
        videoRef.current.srcObject = e.streams[0];

        // FIXME: (yow): handle when ios screen is offline
        // if (!wakeupTimer) {
        //   setWakeupTimer(
        //     setInterval(async () => {
        //       if (!caller || !caller.isOpened || !videoRef.current) {
        //         clearInterval(wakeupTimer);
        //         return;
        //       }
        //       if (isVideoShowing(videoRef.current)) {
        //         clearInterval(wakeupTimer);
        //         return;
        //       }
        //       const ret = await handleToolMenuInput(caller, { timeStamp: Date.now() }, DeviceToolBarMenu.HOME);
        //       if (ret && ret.error?.code === Code.CODE_UNSPECIFIED) {
        //         clearInterval(wakeupTimer);
        //       }
        //     }, 3000),
        //   );
        // }
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
        maxFps: fps ?? 60,
        maxResolution: resolution ?? 720,
      },
    };

    const { platform, serial } = device;
    const webRtcExchanger = WebRtcExchangerFactory.createByPlatform(platform);
    webRtcExchanger.startExchange(
      organizationId,
      device.deviceId,
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
      },
    );

    const caller = new DeviceRTCCaller(device.deviceId, dc);
    caller.setSendThrottleMs(sendThrottleMs);

    setPeerConnection(pc);
    setDeviceRTCCaller(caller);

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setDeviceRTCCaller(undefined);
      setPeerConnection(undefined);
      setHAConnectionError(undefined);
      setLoading(true);
    };
  }, [device?.deviceId, fps, resolution]);

  useEffect(() => {
    return () => {
      console.debug('deviceRTCCaller', deviceRTCCaller);
      deviceRTCCaller?.channel?.close();
      console.debug(`close connection data ${device?.deviceId}`);

      console.debug('peer', peerConnection);
      peerConnection?.close();
      console.debug(`close connection ${device?.deviceId}`);
    };
  }, [peerConnection, deviceRTCCaller, fps, resolution]);

  return { loading, peerConnection, deviceRTCCaller, videoRef, error: haConnectionError };
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
