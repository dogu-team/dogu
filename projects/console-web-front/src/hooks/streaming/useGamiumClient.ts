import { DeviceBase } from '@dogu-private/console';
import { PrivateProtocol } from '@dogu-private/types';
import { Closable, Retry } from '@dogu-tech/common';
import { DeviceClient, DeviceHostClient } from '@dogu-tech/device-client-common';
import { DefaultGamiumEnginePort, GamiumClient, Param } from 'gamium/common';
import { RefObject, useCallback, useEffect, useRef } from 'react';

import { isDesktop } from '../../utils/device';
import { BrowserGamiumService, RequestPriority } from '../../utils/streaming/browser-gamium-service';
import { createDataChannel } from '../../utils/streaming/web-rtc';

type DataChannelLabel = PrivateProtocol.DataChannelLabel;

class GamiumEnginePortForwarder {
  constructor(
    private deviceHostClient: DeviceHostClient,
    private deviceClient: DeviceClient,
    private device: DeviceBase,
    private gamiumEnginePort: number,
  ) {}

  @Retry()
  async forward(): Promise<{ closer: Closable | null; port: number }> {
    const { device, gamiumEnginePort, deviceHostClient, deviceClient } = this;
    const { serial } = this.device;
    if (isDesktop(device)) {
      return { closer: null, port: gamiumEnginePort };
    } else {
      const hostPort = await deviceHostClient.getFreePort();
      const unsub = await deviceClient.forward(serial, hostPort, gamiumEnginePort);
      return { closer: unsub, port: hostPort };
    }
  }
}

const useGamiumClient = (
  peerConnectionRef: RefObject<RTCPeerConnection | undefined>,
  device: DeviceBase | undefined,
  deviceHostClientRef: RefObject<DeviceHostClient | undefined>,
  deviceClientRef: RefObject<DeviceClient | undefined>,
  sendThrottleMs: number,
) => {
  const gamiumClientRef = useRef<GamiumClient | undefined>();
  const closer = useRef<Closable | null>(null);

  const forward = useCallback(
    async (device: DeviceBase) => {
      async function forwardGamiumEnginePort(gamiumEnginePort = DefaultGamiumEnginePort): Promise<number> {
        if (!deviceHostClientRef.current || !deviceClientRef.current) {
          return -1;
        }
        const forwarder = new GamiumEnginePortForwarder(
          deviceHostClientRef.current,
          deviceClientRef.current,
          device,
          gamiumEnginePort,
        );
        const result = await forwarder.forward();
        if (result.closer) {
          closer.current = result.closer;
        }
        return result.port;
      }
      return await forwardGamiumEnginePort();
    },
    [deviceHostClientRef, deviceClientRef],
  );

  const initializeGamiumClient = useCallback(async () => {
    if (!peerConnectionRef.current || !device) {
      return;
    }

    if (peerConnectionRef.current.connectionState !== 'connected') {
      alert('Not ready');
      return;
    }

    const port = await forward(device);

    // TEMP
    setTimeout(() => {
      if (!peerConnectionRef.current) {
        return;
      }

      const gamiumDcLabel: DataChannelLabel = {
        name: 'gamium',
        protocol: {
          $case: 'relayTcp',
          relayTcp: {
            port,
          },
        },
      };
      const gamiumDc = createDataChannel(peerConnectionRef.current, gamiumDcLabel, {
        ordered: true,
        maxRetransmits: 0,
      });
      const gamiumService = new BrowserGamiumService(gamiumDc);
      const gamiumClient = new GamiumClient(gamiumService, console);
      gamiumService.setSendThrottleMs(sendThrottleMs);
      gamiumService.setRequestPriority(Param.Packets_DumpObjectsHierarchyParam, RequestPriority.High);

      gamiumClientRef.current = gamiumClient;
    }, 3000);
  }, [device, forward, sendThrottleMs]);

  const destroyGamiumClient = useCallback(() => {
    console.debug('gamium client closer', closer.current);
    closer.current?.close();
    gamiumClientRef.current?.disconnect();
    gamiumClientRef.current = undefined;
  }, []);

  useEffect(() => {
    if (device?.serial && peerConnectionRef.current?.connectionState === 'connected') {
      initializeGamiumClient();
    }

    return () => {
      destroyGamiumClient();
    };
  }, [device?.serial, peerConnectionRef.current?.connectionState, initializeGamiumClient, destroyGamiumClient]);

  return { gamiumClientRef, initializeGamiumClient, destroyGamiumClient };
};

export default useGamiumClient;
