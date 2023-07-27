import { Serial } from '@dogu-private/types';
import { DeviceClient, DeviceHostClient, HostFileUploader } from '@dogu-tech/device-client-common';
import { useCallback, useEffect, useState } from 'react';

const useDeviceAppInstall = (serial: Serial | undefined, deviceHostClient: DeviceHostClient | undefined, deviceClient: DeviceClient | undefined) => {
  const [app, setApp] = useState<File>();
  const [progress, setProgress] = useState<number>();
  const [uploadedFilePath, setUploadedFilePath] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [result, setResult] = useState<{
    isSuccess: boolean;
    failType?: 'upload' | 'install';
    error?: Error;
  }>();
  const [hostFileUploader, setHostFileUploader] = useState<HostFileUploader | null>(null);

  const reset = useCallback(() => {
    setProgress(undefined);
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
      const chunkSize = 65535 * 16 - 16; // around 1 MB ( datachannel max byte(65535)  * 16(magic number) - packetheader sizes(16) ). for best throughput
      const fr = new FileReader();
      let writeOffset = 0;

      const readSlice = (o: number) => {
        const slice = file.slice(writeOffset, o + chunkSize);
        fr.readAsArrayBuffer(slice);
      };

      fr.addEventListener('error', (error) => console.error('Error reading file:', error));
      fr.addEventListener('abort', (event) => {});
      fr.addEventListener('load', (e) => {
        const result = e.target?.result as ArrayBuffer;
        hostFileUploader.write(result);
        writeOffset += result.byteLength;

        if (writeOffset < file.size) {
          readSlice(writeOffset);
        } else {
          hostFileUploader.end();
        }
      });

      const hostFileUploader = await deviceHostClient.uploadFile(
        file.name,
        file.size,
        (recvOffest: number) => {
          setProgress((recvOffest / totalSize) * 100);
        },
        (filePath: string, error?: Error) => {
          if (error) {
            console.debug('File upload error:', error);
            setResult({
              isSuccess: false,
              failType: 'upload',
              error: error,
            });
            return;
          }
          // receive complete message
          console.debug('File uploaded:', filePath);
          setProgress(100);
          setUploadedFilePath(filePath);
        },
      );
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
        console.debug('installApp error:', e);
        if (e instanceof Error) {
          setResult({
            isSuccess: false,
            failType: 'install',
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

  return { isInstalling, progress, app, result, uploadApp, cancelUpload, runApp };
};

export default useDeviceAppInstall;
