import { DeviceBase } from '@dogu-private/console';
import { RuntimeInfo } from '@dogu-private/types';
import { Closable } from '@dogu-tech/common';
import { DeviceClient } from '@dogu-tech/device-client-common';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

const useDeviceStreamingProfile = (deviceClient: DeviceClient | undefined, device: DeviceBase | undefined | null) => {
  const [runtimeInfos, setRuntimeInfos] = useState<RuntimeInfo[]>([]);
  const router = useRouter();
  const closer = useRef<Closable | undefined>();

  useEffect(() => {
    (async () => {
      if (deviceClient && device) {
        try {
          const unsub = await deviceClient?.subscribeRuntimeInfo(device.serial, (info) => {
            setRuntimeInfos((prev) => {
              if (prev.length < 100) {
                return [...prev, info];
              } else {
                return [...prev.slice(1), info];
              }
            });
          });
          closer.current = unsub;
        } catch (e) {}
      }
    })();

    return () => {
      closer.current?.close();
    };
  }, [device?.serial, router.locale, deviceClient]);

  return runtimeInfos;
};

export default useDeviceStreamingProfile;
