import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { DeviceBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';

import resources from 'src/resources';
import StreamingOptionController from './StreamingOptionController';
import PlatformIcon from '../device/PlatformIcon';
import { flexRowBaseStyle } from '../../styles/box';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';

interface Props {}

const DeviceStreamingBasicMenu = ({}: Props) => {
  const { device, peerConnection } = useDeviceStreamingContext();
  const { t } = useTranslation();

  return (
    <Box tabIndex={-1}>
      {device && (
        <Section>
          <TitleWrapper>
            <Title>{t('device-streaming:infoTabDeviceInfoTitle')}</Title>
          </TitleWrapper>
          <div>
            <InfoDescription style={{ alignItems: 'flex-start' }}>
              <b>{t('device-streaming:deviceName')}:</b>
              {device.name}
            </InfoDescription>
            <InfoDescription>
              <b>{t('device-streaming:devicePlatform')}:</b>
              <PlatformIcon platform={device.platform} />
            </InfoDescription>
            <InfoDescription>
              <b>{t('device-streaming:deviceVersion')}:</b>
              {device.version}
            </InfoDescription>
            <InfoDescription style={{ alignItems: 'flex-start' }}>
              <b>{t('device-streaming:deviceModel')}:</b>
              {device.modelName ? `${device.modelName} (${device.model})` : device.model}
            </InfoDescription>
          </div>
        </Section>
      )}
      <Section>
        <TitleWrapper>
          <Title>{t('device-streaming:infoTabVideoPerfomanceTitle')}</Title>
        </TitleWrapper>
        <div>{peerConnection && <PerformanceViewer peerConnection={peerConnection} />}</div>
      </Section>
      <Section>
        <TitleWrapper>
          <Title>{t('device-streaming:infoTabOptionTitle')}</Title>
        </TitleWrapper>
        <div>
          <StreamingOptionController />
        </div>
      </Section>
      <Section>
        <TitleWrapper>
          <Title> {t('device-streaming:infoTabKeyboardTitle')}</Title>
        </TitleWrapper>
        <div>
          <KeyContent>
            <KeyTitle>{t('device-streaming:pasteToClipboard')}</KeyTitle>
            <KeyCapContainer>
              <KeyCap>ctrl</KeyCap>&nbsp;+&nbsp;<KeyCap>shift</KeyCap>&nbsp;+&nbsp;<KeyCap>v</KeyCap>
            </KeyCapContainer>
          </KeyContent>
        </div>
      </Section>
    </Box>
  );
};

export default React.memo(DeviceStreamingBasicMenu);

interface PerfomanceViewerProps {
  peerConnection: RTCPeerConnection | undefined;
}

const PerformanceViewer = ({ peerConnection }: PerfomanceViewerProps) => {
  const [fps, setFps] = useState();

  useEffect(() => {
    const timer = setInterval(async () => {
      peerConnection?.getStats(null).then(
        (result) =>
          result.forEach((v, k, p) => {
            if (v.type === 'inbound-rtp' && v.framesPerSecond) {
              setFps(v.framesPerSecond);
            }
          }),
        (err) => console.error(err),
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <FrameBox>
      <p>FPS: {fps === undefined ? '--' : fps}</p>
    </FrameBox>
  );
};

const Box = styled.div`
  max-width: 400px;
  margin-right: 20px;
  flex-shrink: 0;
`;

const Section = styled.div`
  margin-bottom: 1rem;
`;

const TitleWrapper = styled.div`
  margin-bottom: 0.25rem;
`;

const Title = styled.p`
  font-weight: 700;
  font-size: 1.1rem;
  line-height: 1.4;
`;

const KeyContent = styled.div`
  margin-bottom: 0.5rem;
`;

const KeyTitle = styled.p`
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
`;

const KeyCapContainer = styled.div`
  display: flex;
  align-items: center;
`;

const KeyCap = styled.div`
  width: 36px;
  height: 36px;
  background-image: url('${resources.icons.keycap}');
  background-size: 36px;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  margin-right: 0.25rem;
  flex-shrink: 0;
`;

const FrameBox = styled.div``;

const InfoDescription = styled.p`
  ${flexRowBaseStyle}
  margin: .25rem 0;

  b {
    font-weight: 700;
    flex-shrink: 0;
    margin-right: 0.25rem;
  }
`;
