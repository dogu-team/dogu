import { PrivateProtocol, WebSocketConnection } from '@dogu-private/types';
import { DeviceClient, DeviceHostClient } from '@dogu-tech/device-client-common';
import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { BrowserDeviceInspector } from '../../utils/streaming/browser-device-inspector';
import { BrowserDeviceService } from '../../utils/streaming/browser-device-service';
import { createDataChannel } from '../../utils/streaming/web-rtc';

type DataChannelLabel = PrivateProtocol.DataChannelLabel;

const useDeviceClient = (peerConnection: RTCPeerConnection | undefined, sendThrottleMs: number) => {
  const deviceClient = useRef<DeviceClient | undefined>(undefined);
  const deviceHostClient = useRef<DeviceHostClient | undefined>(undefined);
  const deviceChannel = useRef<RTCDataChannel | undefined>(undefined);
  const deviceInspector = useRef<BrowserDeviceInspector | undefined>(undefined);

  useEffect(() => {
    if (peerConnection) {
      const deviceHttpDcLabel: DataChannelLabel = {
        name: 'device-http',
        protocol: {
          $case: 'deviceHttp',
          deviceHttp: {},
        },
      };
      const deviceHttpDc = createDataChannel(peerConnection, deviceHttpDcLabel, {
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
        const channel = createDataChannel(peerConnection, deviceWsDcLabel, {
          ordered: true,
          maxRetransmits: 5,
        });
        deviceChannel.current = channel;
        channel.bufferedAmountLowThreshold = 65535;
        return { name, channel };
      };
      const deviceService = new BrowserDeviceService(deviceHttpDc, deviceServerWsDcCreator, sendThrottleMs);

      const dc = new DeviceClient(deviceService);
      const dhc = new DeviceHostClient(deviceService);
      const di = new BrowserDeviceInspector(deviceService);

      deviceClient.current = dc;
      deviceHostClient.current = dhc;
      deviceInspector.current = di;
    }

    return () => {
      console.debug('close device channel');
      deviceChannel.current?.close();
      deviceClient.current = undefined;
      deviceHostClient.current = undefined;
      deviceChannel.current = undefined;
    };
  }, [peerConnection, sendThrottleMs]);

  return { deviceClient, deviceHostClient, deviceChannel, deviceInspector };
};

export default useDeviceClient;
