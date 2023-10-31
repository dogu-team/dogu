import { PrivateProtocol, WebSocketConnection } from '@dogu-private/types';
import { DeviceClient, DeviceHostClient } from '@dogu-tech/device-client-common';
import { RefObject, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { BrowserDeviceInspector } from '../../utils/streaming/browser-device-inspector';
import { BrowserDeviceService } from '../../utils/streaming/browser-device-service';
import { createDataChannel } from '../../utils/streaming/web-rtc';

type DataChannelLabel = PrivateProtocol.DataChannelLabel;

const useDeviceClient = (peerConnectionRef: RefObject<RTCPeerConnection | undefined>, sendThrottleMs: number) => {
  const deviceClientRef = useRef<DeviceClient | undefined>(undefined);
  const deviceHostClientRef = useRef<DeviceHostClient | undefined>(undefined);
  const deviceChannelRef = useRef<RTCDataChannel | undefined>(undefined);
  const deviceInspectorRef = useRef<BrowserDeviceInspector | undefined>(undefined);

  useEffect(() => {
    if (peerConnectionRef.current) {
      const deviceHttpDcLabel: DataChannelLabel = {
        name: 'device-http',
        protocol: {
          $case: 'deviceHttp',
          deviceHttp: {},
        },
      };

      const deviceHttpDc = createDataChannel(peerConnectionRef.current, deviceHttpDcLabel, {
        ordered: false,
        maxRetransmits: 5,
      });
      deviceHttpDc.bufferedAmountLowThreshold = 65535;

      const deviceServerWsDcCreator = (connection: WebSocketConnection) => {
        const name = `device-ws-${uuidv4()}`;
        const deviceWsDcLabel: DataChannelLabel = {
          name,
          protocol: {
            $case: 'deviceWebSocket',
            deviceWebSocket: {
              connection,
            },
          },
        };
        const channel = createDataChannel(peerConnectionRef.current!, deviceWsDcLabel, {
          ordered: true,
          maxRetransmits: 5,
        });
        deviceChannelRef.current = channel;
        channel.bufferedAmountLowThreshold = 65535;
        return { name, channel };
      };
      const deviceService = new BrowserDeviceService(deviceHttpDc, deviceServerWsDcCreator, sendThrottleMs);

      const dc = new DeviceClient(deviceService);
      const dhc = new DeviceHostClient(deviceService);
      const di = new BrowserDeviceInspector(deviceService);

      deviceClientRef.current = dc;
      deviceHostClientRef.current = dhc;
      deviceInspectorRef.current = di;
    }

    return () => {
      console.debug('close device channel');
      deviceChannelRef.current?.close();
      deviceClientRef.current = undefined;
      deviceHostClientRef.current = undefined;
      deviceChannelRef.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendThrottleMs]);

  return {
    deviceClientRef,
    deviceHostClientRef,
    deviceChannelRef,
    deviceInspectorRef,
  };
};

export default useDeviceClient;
