import { DeviceBase } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import { Closable } from '@dogu-tech/common';
import { DeviceClient } from '@dogu-tech/device-client-common';
import { RefObject, useEffect, useState } from 'react';

const useDeviceAlert = (
  deviceClientRef: RefObject<DeviceClient | undefined> | undefined,
  device: DeviceBase | undefined | null,
) => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  useEffect(() => {
    if (device?.serial) {
      setImageBase64(null);
    }
  }, [device?.serial]);

  useEffect(() => {
    let closer: Closable | undefined;
    (async () => {
      if (deviceClientRef?.current && device && device.platform === Platform.PLATFORM_IOS) {
        const unsubscriber = await deviceClientRef.current.subscribeAlert(device.serial, {
          onAlert: (e) => {
            deviceClientRef.current
              ?.screenshot(device.serial)
              .then((value) => setImageBase64(value))
              .catch((e) => console.error(`Failed to get screenshot: ${e}`));
          },
          onClose: (e) => {
            setImageBase64(null);
          },
        });
        closer = unsubscriber;
      }
    })();

    return () => {
      closer?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device?.serial, device?.platform]);

  return {
    imageBase64,
  };
};

export default useDeviceAlert;
