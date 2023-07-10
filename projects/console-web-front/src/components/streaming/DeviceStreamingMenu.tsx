import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { DeviceBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';

import resources from 'src/resources';
import StreamingOptionController from './StreamingOptionController';
import PlatformIcon from '../runner/PlatformIcon';
import { flexRowBaseStyle } from '../../styles/box';

interface Props {
  peerConnection: RTCPeerConnection | undefined;
  runner: DeviceBase | undefined;
}

const DeviceStreamingMenu = ({ peerConnection, runner }: Props) => {
  const { t } = useTranslation();

  return (
    <Box tabIndex={-1}>
      {runner && (
        <Section>
          <TitleWrapper>
            <Title>{t('runner-streaming:infoTabDeviceInfoTitle')}</Title>
          </TitleWrapper>
          <div>
            <InfoDescription>
              <b>{t('runner-streaming:devicePlatform')}:</b>
              <PlatformIcon platform={runner.platform} />
            </InfoDescription>
            <InfoDescription>
              <b>{t('runner-streaming:deviceVersion')}:</b>
              {runner.version}
            </InfoDescription>
            <InfoDescription style={{ alignItems: 'flex-start' }}>
              <b>{t('runner-streaming:deviceModel')}:</b>
              {runner.modelName ? `${runner.modelName} (${runner.model})` : runner.model}
            </InfoDescription>
          </div>
        </Section>
      )}
      <Section>
        <TitleWrapper>
          <Title>{t('runner-streaming:infoTabVideoPerfomanceTitle')}</Title>
        </TitleWrapper>
        <div>
          <PerformanceViewer peerConnection={peerConnection} />
        </div>
      </Section>
      <Section>
        <TitleWrapper>
          <Title>{t('runner-streaming:infoTabOptionTitle')}</Title>
        </TitleWrapper>
        <div>
          <StreamingOptionController />
        </div>
      </Section>
      <Section>
        <TitleWrapper>
          <Title> {t('runner-streaming:infoTabKeyboardTitle')}</Title>
        </TitleWrapper>
        <div>
          <KeyContent>
            <KeyTitle>{t('runner-streaming:pasteToClipboard')}</KeyTitle>
            <KeyCapContainer>
              <KeyCap>ctrl</KeyCap>&nbsp;+&nbsp;<KeyCap>shift</KeyCap>&nbsp;+&nbsp;<KeyCap>v</KeyCap>
            </KeyCapContainer>
          </KeyContent>
        </div>
      </Section>
    </Box>
  );
};

export default React.memo(DeviceStreamingMenu);

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
