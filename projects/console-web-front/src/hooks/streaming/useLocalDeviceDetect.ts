import { DeviceBase } from '@dogu-private/console';
import { LocalDeviceDetectToken } from '@dogu-private/types';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { v4 as uuidv4 } from 'uuid';

import { swrAuthFetcher } from '../../api';
import { isDesktop } from '../../utils/device';

async function sendLocalDeviceDetectToken(device: DeviceBase | undefined) {
  if (!device?.host?.deviceServerPort) {
    return;
  }
  const uuid = uuidv4();
  const url = `http://localhost:${device.host.deviceServerPort}`;

  const deviceServerApi = axios.create({
    baseURL: url,
  });
  await deviceServerApi.post(`/devices/${device.serial}/local-device-detect-token`, {
    token: uuid,
    lifeTimeSeconds: 60,
  });
  return uuid;
}

const useLocalDeviceDetect = (device: DeviceBase | undefined) => {
  const router = useRouter();
  const [isSelf, setIsSelf] = useState<boolean>(false);
  const [localDeviceDetectToken, setLocalDeviceDetectToken] = useState<LocalDeviceDetectToken | undefined>(undefined);
  const {
    data: remoteDeviceDetectTokens,
    error: remoteError,
    isLoading: remoteIsLoading,
  } = useSWR<LocalDeviceDetectToken[]>(
    !!device && isDesktop(device) && (localDeviceDetectToken ? `/organizations/${router.query.orgId}/devices/${device.deviceId}/localDeviceDetectTokens` : null),
    swrAuthFetcher,
    {},
  );

  useEffect(() => {
    if (isDesktop(device)) {
      sendLocalDeviceDetectToken(device).then((token) => {
        setLocalDeviceDetectToken(token);
      });
    }
  }, [device]);

  useEffect(() => {
    if (localDeviceDetectToken && remoteDeviceDetectTokens) {
      setIsSelf(!!remoteDeviceDetectTokens.find((token) => token === localDeviceDetectToken));
    }
  }, [localDeviceDetectToken, remoteDeviceDetectTokens]);

  return isSelf;
};

export default useLocalDeviceDetect;
