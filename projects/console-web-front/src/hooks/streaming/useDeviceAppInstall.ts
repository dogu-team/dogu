import { OrganizationId, Serial } from '@dogu-private/types';
import { DeviceClient, DeviceHostClient } from '@dogu-tech/device-client-common';
import { RefObject, useCallback, useState } from 'react';
import { uploadDeviceApp } from '../../api/organization';

const useDeviceAppInstall = (
  serial: Serial | undefined,
  deviceHostClientRef: RefObject<DeviceHostClient | undefined> | undefined,
  deviceClientRef: RefObject<DeviceClient | undefined> | undefined,
  option: { isCloudDevice: boolean },
) => {
  const [app, setApp] = useState<File>();
  const [progress, setProgress] = useState<number>();
  const [uploadedFilePath, setUploadedFilePath] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [result, setResult] = useState<{
    isSuccess: boolean;
    failType?: 'upload' | 'resign' | 'install';
    error?: Error;
  }>();

  const reset = useCallback(() => {
    setProgress(undefined);
    // setIsInstalling(false);
    setResult(undefined);
    setApp(undefined);
    setUploadedFilePath('');
  }, []);

  const uploadApp = useCallback(async (organizationId: OrganizationId, file: File) => {
    if (file.size === 0) {
      alert('File size is 0. Choose another file.');
      return;
    }

    if (!deviceHostClientRef?.current) {
      return;
    }

    setApp(file);

    try {
      const path = await uploadDeviceApp(organizationId, file, (e) => {
        if (e.total) {
          setProgress((e.loaded / e.total) * 100);
        }
      });
      console.log(path);
      setUploadedFilePath(path);
    } catch (e) {
      setResult({
        isSuccess: false,
        failType: 'upload',
        error: new Error('Upload failed'),
      });
    }

    setProgress(0);

    // const totalSize = file.size;
    // const chunkSize = 65535 * 16 - 16; // around 1 MB ( datachannel max byte(65535)  * 16(magic number) - packetheader sizes(16) ). for best throughput
    // const fr = new FileReader();
    // let writeOffset = 0;

    // const readSlice = (o: number) => {
    //   const slice = file.slice(writeOffset, o + chunkSize);
    //   fr.readAsArrayBuffer(slice);
    // };

    // fr.addEventListener('error', (error) => console.error('Error reading file:', error));
    // fr.addEventListener('abort', (event) => {});
    // fr.addEventListener('load', (e) => {
    //   const result = e.target?.result as ArrayBuffer;
    //   hostFileUploader.write(result);
    //   writeOffset += result.byteLength;

    //   if (writeOffset < file.size) {
    //     readSlice(writeOffset);
    //   } else {
    //     hostFileUploader.end();
    //   }
    // });

    // const hostFileUploader = await deviceHostClientRef.current.uploadFile(
    //   file.name,
    //   file.size,
    //   (recvOffest: number) => {
    //     setProgress((recvOffest / totalSize) * 100);
    //   },
    //   (filePath: string, error?: Error) => {
    //     if (error) {
    //       console.debug('File upload error:', error);
    //       setResult({
    //         isSuccess: false,
    //         failType: 'upload',
    //         error: error,
    //       });
    //       return;
    //     }
    //     // receive complete message
    //     console.debug('File uploaded:', filePath);
    //     setProgress(100);
    //     setUploadedFilePath(filePath);
    //   },
    // );
    // setHostFileUploader(hostFileUploader);
    // setProgress(0);
    // readSlice(0);
  }, []);

  // const installApp = useCallback(
  //   async (uploadedFilePath: string) => {
  //     if (!serial || !deviceClientRef?.current || !deviceHostClientRef?.current) {
  //       return;
  //     }

  //     // setIsInstalling(true);
  //     if (option.isCloudDevice) {
  //       try {
  //         await deviceHostClientRef.current.resignApp({ filePath: uploadedFilePath });
  //       } catch (e) {
  //         const error = errorify(e);
  //         console.debug('resignApp error:', error);
  //         setResult({
  //           isSuccess: false,
  //           failType: 'resign',
  //           error,
  //         });
  //         return;
  //       }
  //     }

  //     try {
  //       await deviceClientRef.current.installApp(serial, uploadedFilePath);
  //       setResult({
  //         isSuccess: true,
  //       });
  //       setTimeout(() => reset(), 2000);
  //     } catch (e) {
  //       const error = errorify(e);
  //       console.debug('installApp error:', error);
  //       setResult({
  //         isSuccess: false,
  //         failType: 'install',
  //         error,
  //       });
  //     }
  //   },
  //   [reset, serial],
  // );

  // useEffect(() => {
  //   if (uploadedFilePath.length > 0) {
  //     installApp(uploadedFilePath);
  //   }
  // }, [installApp, uploadedFilePath]);

  // const cancelUpload = useCallback(() => {
  //   hostFileUploader?.end();
  //   hostFileUploader?.close(1001, 'Canceled');
  //   reset();
  // }, [hostFileUploader, reset]);

  const runApp = useCallback(async () => {
    if (!serial || !deviceClientRef?.current || !uploadedFilePath) {
      return;
    }

    await deviceClientRef.current.runApp(serial, uploadedFilePath);
  }, [serial, uploadedFilePath]);

  // return { isInstalling, progress, app, result, uploadApp, cancelUpload, runApp };
  return { isInstalling, progress, app, result, uploadApp, runApp };
};

export default useDeviceAppInstall;
