import { DeviceBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import React, { useState } from 'react';
import styled from 'styled-components';

import useDeviceAlert from '../../hooks/streaming/useDeviceAlert';
import useDeviceClient from '../../hooks/streaming/useDeviceClient';
import { DeviceStreamingContext } from '../../hooks/streaming/useDeviceStreamingContext';
import useGamiumClient from '../../hooks/streaming/useGamiumClient';
import useInspector from '../../hooks/streaming/useInspector';
import useLocalDeviceDetect from '../../hooks/streaming/useLocalDeviceDetect';
import useRTCConnection from '../../hooks/streaming/useRTCConnection';
import { StreamingMode } from '../../types/device';
import { StreamingErrorType } from '../../types/streaming';
import ErrorBox from '../common/boxes/ErrorBox';
import ApplicationUploader from './ApplicationUploader';
import DeviceControlToolbar from './DeviceControlToolbar';
import DeviceStreamingBasicMenu from './DeviceStreamingBasicMenu';
import Inspector from './Inspector';
import StreamingVideo from './StreamingVideo';

interface Props {
  device: DeviceBase | undefined;
  children: React.ReactNode;
  pid?: number;
  isCloudDevice?: boolean;
  isAdmin: boolean;
}

const THROTTLE_MS = 33;

const DeviceStreaming = ({ device, children, pid, isCloudDevice, isAdmin }: Props) => {
  const [mode, setMode] = useState<StreamingMode>('input');
  const isSelf = useLocalDeviceDetect(device);
  const { loading, deviceRTCCallerRef, peerConnectionRef, videoRef, error } = useRTCConnection(
    { device, pid, isCloudDevice },
    THROTTLE_MS,
  );
  const deviceService = useDeviceClient(peerConnectionRef, THROTTLE_MS);
  const gamiumService = useGamiumClient(
    peerConnectionRef,
    device,
    deviceService.deviceHostClientRef,
    deviceService.deviceClientRef,
    THROTTLE_MS,
  );
  const inspector = useInspector(deviceService.deviceInspectorRef, device ?? null, videoRef);
  const { imageBase64 } = useDeviceAlert(deviceService.deviceClientRef, device ?? null);
  const { t } = useTranslation();

  if (error) {
    if (error.type === StreamingErrorType.CONNECTION_REFUSED) {
      return (
        <div style={{ flex: 1 }}>
          <ErrorBox title={'Your session has been expired'} desc={''} />
        </div>
      );
    }

    return (
      <div style={{ flex: 1 }}>
        <ErrorBox
          title={t('device-streaming:deviceStreamingStreamingErrorTitle')}
          desc={t('device-streaming:deviceRTCStreamingDisconnectedErrorMessage')}
        />
      </div>
    );
  }

  if (peerConnectionRef.current?.iceConnectionState === 'disconnected') {
    return (
      <>
        <div style={{ flex: 1 }}>
          <ErrorBox
            title={t('device-streaming:deviceStreamingStreamingErrorTitle')}
            desc={t('device-streaming:deviceRTCStreamingDisconnectedErrorMessage')}
          />
        </div>
      </>
    );
  }

  if (peerConnectionRef.current?.iceConnectionState === 'failed') {
    return (
      <>
        <div style={{ flex: 1 }}>
          <ErrorBox
            title={t('device-streaming:deviceStreamingStreamingErrorTitle')}
            desc={t('device-streaming:deviceRTCStreamingFailedErrorMessage')}
          />
        </div>
      </>
    );
  }

  return (
    <DeviceStreamingContext.Provider
      value={{
        mode,
        loading,
        deviceRTCCaller: deviceRTCCallerRef.current ?? null,
        peerConnection: peerConnectionRef.current ?? null,
        error: error ?? null,
        gamiumService,
        deviceService,
        device: device ?? null,
        isSelf,
        videoRef,
        inspector,
        updateMode: setMode,
        isCloudDevice,
        deviceScreenshotBase64: imageBase64,
        isAdmin,
      }}
    >
      <Box visible={!!device}>{children}</Box>
    </DeviceStreamingContext.Provider>
  );
};

DeviceStreaming.Video = StreamingVideo;
DeviceStreaming.Controlbar = DeviceControlToolbar;
DeviceStreaming.BasicMenu = DeviceStreamingBasicMenu;
DeviceStreaming.Inspector = Inspector;
DeviceStreaming.AppInstaller = ApplicationUploader;

export default DeviceStreaming;

const Box = styled.div<{ visible: boolean }>`
  display: ${(props) => (props.visible ? 'block' : 'none')};
  ${(props) => (!props.visible ? 'height: 0; width: 0;' : 'width: 100%; height: 100%;')}
`;
