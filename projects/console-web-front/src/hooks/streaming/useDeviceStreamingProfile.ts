import { DeviceBase } from '@dogu-private/console';
import { RuntimeInfo } from '@dogu-private/types';
import { Closable } from '@dogu-tech/common';
import { DeviceClient } from '@dogu-tech/device-client-common';
import { useRouter } from 'next/router';
import { RefObject, useEffect, useRef, useState } from 'react';

const useDeviceStreamingProfile = (
  deviceClientRef: RefObject<DeviceClient | undefined> | undefined,
  device: DeviceBase | undefined | null,
) => {
  const [runtimeInfos, setRuntimeInfos] = useState<RuntimeInfo[]>([]);
  const router = useRouter();
  const closer = useRef<Closable | undefined>();

  useEffect(() => {
    (async () => {
      if (deviceClientRef?.current && device) {
        setRuntimeInfos([]);
        try {
          const unsub = await deviceClientRef.current.subscribeRuntimeInfo(device.serial, (info) => {
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
  }, [deviceClientRef?.current, device?.serial, router.locale]);

  return runtimeInfos;
};

export default useDeviceStreamingProfile;
