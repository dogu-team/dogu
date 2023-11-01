import { OrganizationId, Serial } from '@dogu-private/types';
import { DeviceClient, DeviceHostClient } from '@dogu-tech/device-client-common';
import { RefObject, useCallback, useState } from 'react';
import { v4 } from 'uuid';
import { uploadDeviceApp } from '../../api/organization';

const useDeviceAppInstall = (
  serial: Serial | undefined,
  deviceHostClientRef: RefObject<DeviceHostClient | undefined> | undefined,
  deviceClientRef: RefObject<DeviceClient | undefined> | undefined,
  option: { isCloudDevice: boolean },
) => {
  const [app, setApp] = useState<File>();
  const [progress, setProgress] = useState<number>();
  const [isInstalling, setIsInstalling] = useState(false);
  const [result, setResult] = useState<{
    isSuccess: boolean;
    failType?: 'upload' | 'resign' | 'install';
    error?: Error;
  }>();

  const reset = useCallback(() => {
    setProgress(undefined);
    setResult(undefined);
    setApp(undefined);
  }, []);

  const uploadAndInstallApp = useCallback(
    async (organizationId: OrganizationId, file: File) => {
      if (file.size === 0) {
        alert('File size is 0. Choose another file.');
        return;
      } else if (file.size > 1024 * 1024 * 1024) {
        alert('File size is over 1GB. Choose another file.');
        return;
      }

      if (!deviceHostClientRef?.current || !serial) {
        return;
      }

      setApp(file);

      try {
        const path = await uploadDeviceApp(organizationId, file, (e) => {
          if (e.total) {
            setProgress((e.loaded / e.total) * 100);
          }
        });
        setProgress(undefined);

        const uuid = v4();
        const basePath = await deviceHostClientRef.current.getTempPath();
        const hostFilePath = `${basePath}/${uuid}/${file.name}`;

        setIsInstalling(true);
        await deviceHostClientRef.current.downloadSharedResource(hostFilePath, path, file.size);
        // resign app for ios
        if (option.isCloudDevice && file.name.endsWith('.ipa')) {
          await deviceHostClientRef.current.resignApp({ filePath: hostFilePath });
        }
        await deviceClientRef?.current?.installApp(serial, hostFilePath);
        await deviceClientRef?.current?.runApp(serial, hostFilePath);

        setIsInstalling(false);
        setResult({
          isSuccess: true,
        });
        setTimeout(() => reset(), 2000);

        deviceHostClientRef.current
          .removeTemp({
            pathUnderTemp: `${uuid}/${file.name}`,
          })
          .catch((e) => {
            console.error(`Temp application removal failed`, e);
          });
      } catch (e) {
        setResult({
          isSuccess: false,
          failType: 'upload',
          error: new Error('Upload failed'),
        });
        setTimeout(() => reset(), 2000);
      }
    },
    [serial, reset],
  );

  return { isInstalling, progress, app, result, uploadAndInstallApp };
};

export default useDeviceAppInstall;
