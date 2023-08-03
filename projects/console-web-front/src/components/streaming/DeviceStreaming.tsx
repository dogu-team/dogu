import { DeviceBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import React, { useState } from 'react';
import styled from 'styled-components';

import useDeviceClient from '../../hooks/streaming/useDeviceClient';
import { DeviceStreamingContext } from '../../hooks/streaming/useDeviceStreamingContext';
import useGamiumClient from '../../hooks/streaming/useGamiumClient';
import useInspector from '../../hooks/streaming/useInspector';
import useLocalDeviceDetect from '../../hooks/streaming/useLocalDeviceDetect';
import useRTCConnection from '../../hooks/streaming/useRTCConnection';
import { flexRowCenteredStyle } from '../../styles/box';
import { StreamingMode } from '../../types/device';
import ErrorBox from '../common/boxes/ErrorBox';
import ApplicationUploader from './ApplicationUploader';
import DeviceControlToolbar from './DeviceControlToolbar';
import DeviceStreamingBasicMenu from './DeviceStreamingBasicMenu';
import Inspector from './Inspector';
import StreamingVideo from './StreamingVideo';

interface Props {
  device: DeviceBase | undefined;
  children: React.ReactNode;
}

const THROTTLE_MS = 33;

const DeviceStreaming = ({ device, children }: Props) => {
  const [mode, setMode] = useState<StreamingMode>('input');
  const isSelf = useLocalDeviceDetect(device);
  const { loading, deviceRTCCaller, peerConnection, videoRef, error } = useRTCConnection(device, THROTTLE_MS);
  const deviceService = useDeviceClient(peerConnection, THROTTLE_MS);
  const gamiumService = useGamiumClient(peerConnection, device, deviceService.deviceHostClient, deviceService.deviceClient, THROTTLE_MS);
  const inspector = useInspector(deviceService?.deviceInspector, device ?? null, videoRef);
  const { t } = useTranslation();

  if (error) {
    return (
      <>
        <div style={{ flex: 1 }}>
          <ErrorBox title={t('device-streaming:deviceStreamingStreamingErrorTitle')} desc={t('device-streaming:deviceRTCStreamingDisconnectedErrorMessage')} />
        </div>
      </>
    );
  }

  if (peerConnection?.iceConnectionState === 'disconnected') {
    return (
      <>
        <div style={{ flex: 1 }}>
          <ErrorBox title={t('device-streaming:deviceStreamingStreamingErrorTitle')} desc={t('device-streaming:deviceRTCStreamingDisconnectedErrorMessage')} />
        </div>
      </>
    );
  }

  if (peerConnection?.iceConnectionState === 'failed') {
    return (
      <>
        <div style={{ flex: 1 }}>
          <ErrorBox title={t('device-streaming:deviceStreamingStreamingErrorTitle')} desc={t('device-streaming:deviceRTCStreamingFailedErrorMessage')} />
        </div>
      </>
    );
  }

  return (
    <DeviceStreamingContext.Provider
      value={{
        mode,
        loading,
        deviceRTCCaller: deviceRTCCaller ?? null,
        peerConnection: peerConnection ?? null,
        error: error ?? null,
        gamiumService,
        deviceService,
        device: device ?? null,
        isSelf,
        videoRef,
        inspector,
        updateMode: setMode,
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

const LoadingBox = styled.div`
  width: 100%;
  ${flexRowCenteredStyle}
  flex-direction: column;

  p {
    margin-top: 1rem;
    white-space: pre-wrap;
    text-align: center;
    line-height: 1.4;
  }
`;
