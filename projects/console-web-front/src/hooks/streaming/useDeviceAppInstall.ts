import { Serial } from '@dogu-private/types';
import { DeviceClient, DeviceHostClient, HostFileUploader } from '@dogu-tech/device-client-common';
import { useCallback, useEffect, useState } from 'react';

const useDeviceAppInstall = (serial: Serial | undefined, deviceHostClient: DeviceHostClient | undefined, deviceClient: DeviceClient | undefined) => {
  const [app, setApp] = useState<File>();
  const [progress, setProgress] = useState<number>();
  const [uploadedFilePath, setUploadedFilePath] = useState('');
  const [isGathering, setIsGathering] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [result, setResult] = useState<{
    isSuccess: boolean;
    error?: Error;
  }>();
  const [hostFileUploader, setHostFileUploader] = useState<HostFileUploader | null>(null);

  const reset = useCallback(() => {
    setProgress(undefined);
    setIsGathering(false);
    setIsInstalling(false);
    setResult(undefined);
    setApp(undefined);
    setUploadedFilePath('');
  }, []);

  const uploadApp = useCallback(
    async (file: File) => {
      if (file.size === 0) {
        alert('File size is 0. Choose another file.');
        return;
      }

      if (!deviceHostClient) {
        return;
      }

      setApp(file);

      const totalSize = file.size;
      const chunkSize = 16384; // 16KB
      const fr = new FileReader();
      let offset = 0;

      const readSlice = (o: number) => {
        const slice = file.slice(offset, o + chunkSize);
        fr.readAsArrayBuffer(slice);
      };

      fr.addEventListener('error', (error) => console.error('Error reading file:', error));
      fr.addEventListener('abort', (event) => {});
      fr.addEventListener('load', (e) => {
        const result = e.target?.result as ArrayBuffer;
        hostFileUploader.write(result);
        offset += result.byteLength;
        setProgress((offset / totalSize) * 100);

        if (offset < file.size) {
          readSlice(offset);
        } else {
          // send complete message
          setProgress(100);
          setTimeout(() => {
            setProgress(undefined);
          }, 500);
          setIsGathering(true);
          hostFileUploader.end();
        }
      });

      const hostFileUploader = await deviceHostClient.uploadFile(file.name, file.size, (filePath: string) => {
        // receive complete message
        console.debug('File uploaded:', filePath);
        setIsGathering(false);
        setUploadedFilePath(filePath);
      });
      setHostFileUploader(hostFileUploader);
      setProgress(0);
      readSlice(0);
    },
    [deviceHostClient],
  );

  const installApp = useCallback(
    async (uploadedFilePath: string) => {
      if (!serial || !deviceClient) {
        return;
      }

      setIsInstalling(true);
      try {
        await deviceClient.installApp(serial, uploadedFilePath);
        setResult({
          isSuccess: true,
        });
        setTimeout(() => reset(), 2000);
      } catch (e) {
        if (e instanceof Error) {
          setResult({
            isSuccess: false,
            error: e,
          });
        }
      }
    },
    [reset, deviceClient, serial],
  );

  useEffect(() => {
    if (uploadedFilePath.length > 0) {
      installApp(uploadedFilePath);
    }
  }, [installApp, uploadedFilePath]);

  const cancelUpload = useCallback(() => {
    hostFileUploader?.end();
    hostFileUploader?.close(1001, 'Canceled');
    reset();
  }, [hostFileUploader, reset]);

  const runApp = useCallback(async () => {
    if (!serial || !deviceClient || !uploadedFilePath) {
      return;
    }

    await deviceClient.runApp(serial, uploadedFilePath);
  }, [serial, uploadedFilePath, deviceClient]);

  return { isInstalling, progress, isGathering, app, result, uploadApp, cancelUpload, runApp };
};

export default useDeviceAppInstall;
