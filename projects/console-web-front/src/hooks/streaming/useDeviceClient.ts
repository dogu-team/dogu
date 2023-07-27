import { PrivateProtocol, WebSocketConnection } from '@dogu-private/types';
import { DeviceClient, DeviceHostClient } from '@dogu-tech/device-client-common';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { BrowserDeviceInspector } from '../../utils/streaming/browser-device-inspector';
import { BrowserDeviceService } from '../../utils/streaming/browser-device-service';
import { createDataChannel } from '../../utils/streaming/web-rtc';

type DataChannelLabel = PrivateProtocol.DataChannelLabel;

const useDeviceClient = (peerConnection: RTCPeerConnection | undefined, sendThrottleMs: number) => {
  const [deviceClient, setDeviceClient] = useState<DeviceClient>();
  const [deviceHostClient, setDeviceHostClient] = useState<DeviceHostClient>();
  const [deviceChannel, setDeviceChannel] = useState<RTCDataChannel>();
  const [deviceInspector, setDeviceInspector] = useState<BrowserDeviceInspector>();

  useEffect(() => {
    if (peerConnection) {
      const deviceHttpDcLabel: DataChannelLabel = {
        name: 'device-http',
        protocol: {
          $case: 'deviceHttp',
          deviceHttp: {},
        },
      };
      const deviceHttpDc = createDataChannel(peerConnection, deviceHttpDcLabel, { ordered: false, maxRetransmits: 0 });
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
        const channel = createDataChannel(peerConnection, deviceWsDcLabel, { ordered: true, maxRetransmits: 3 });
        setDeviceChannel(channel);
        channel.bufferedAmountLowThreshold = 65535;
        return { name, channel };
      };
      const deviceService = new BrowserDeviceService(deviceHttpDc, deviceServerWsDcCreator, sendThrottleMs);

      const deviceClient = new DeviceClient(deviceService);
      const deviceHostClient = new DeviceHostClient(deviceService);
      const deviceInspector = new BrowserDeviceInspector(deviceService);

      setDeviceClient(deviceClient);
      setDeviceHostClient(deviceHostClient);
      setDeviceInspector(deviceInspector);
    }

    return () => {
      console.debug('close device channel');
      deviceChannel?.close();
      setDeviceClient(undefined);
      setDeviceHostClient(undefined);
      setDeviceChannel(undefined);
    };
  }, [peerConnection, sendThrottleMs]);

  return { deviceClient, deviceHostClient, deviceChannel, deviceInspector };
};

export default useDeviceClient;
