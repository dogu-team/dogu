import { CheckCircleOutlined, CloseOutlined, ExclamationCircleOutlined, InboxOutlined, LoadingOutlined } from '@ant-design/icons';
import { Platform } from '@dogu-private/types';
import { Button, Divider, Progress, Steps, Switch, Tooltip, Upload } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import useDeviceAppInstall from '../../hooks/streaming/useDeviceAppInstall';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { flexRowCenteredStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
import { getAvailableApplicationExtension } from '../../utils/streaming/streaming';
import { convertByteWithMaxUnit } from '../../utils/unit';

interface Props {
  // runner: DeviceBase;
  // deviceClient: DeviceClient;
  // deviceHostClient: DeviceHostClient;
}

const ApplicationUploader = ({}: Props) => {
  const { device, deviceService, loading } = useDeviceStreamingContext();
  const { uploadApp, cancelUpload, runApp, isInstalling, progress, isGathering, app, result } = useDeviceAppInstall(
    device?.serial,
    deviceService?.deviceHostClient,
    deviceService?.deviceClient,
  );
  const [shouldRun, setShouldRun] = useState(false);
  const { t } = useTranslation();

  const availableExtension = getAvailableApplicationExtension(device?.platform ?? Platform.UNRECOGNIZED);

  useEffect(() => {
    (async () => {
      if (result?.isSuccess && shouldRun) {
        try {
          await runApp();
        } catch (e) {}
      }
    })();
  }, [result?.isSuccess, shouldRun, runApp]);

  return (
    <Box>
      <div>
        <Title style={{ marginBottom: '.5rem' }}>{t('runner-streaming:uploadApplicationOptionTitle')}</Title>
        <FlexRow>
          <p>{t('runner-streaming:uploadApplicationRunOptionText')}</p>
          <Switch onChange={setShouldRun} checked={shouldRun} disabled={loading} />
        </FlexRow>
      </div>
      <Divider />
      <StyledUpload
        name="app"
        accept={availableExtension}
        customRequest={async (option) => {
          await uploadApp(option.file as File);
        }}
        progress={{
          format: () => null,
        }}
        showUploadList={false}
        disabled={loading || !!app}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t('runner-streaming:uploadApplicationDescription')}</p>
        <p className="ant-upload-hint">{t('runner-streaming:uploadApplicationHint', { extension: availableExtension })}</p>
      </StyledUpload>
      {app && (
        <ApplicationInfoBox>
          <FlexRow>
            <Title>{t('runner-streaming:uploadApplicationAppInfo')}</Title>
            <div>
              <Tooltip title="Cancel">
                <Button danger icon={<CloseOutlined />} onClick={cancelUpload} />
              </Tooltip>
            </div>
          </FlexRow>
          <InfoContent>
            <InfoTitle>{t('runner-streaming:uploadApplicationName')}</InfoTitle>
            <p>{app.name}</p>
          </InfoContent>
          <InfoContent>
            <InfoTitle>{t('runner-streaming:uploadApplicationSize')}</InfoTitle>
            <p>{convertByteWithMaxUnit(app.size)}</p>
          </InfoContent>
          <div>
            <InfoTitle>{t('runner-streaming:uploadApplicationStatus')}</InfoTitle>
            {result ? (
              result.isSuccess ? (
                <FlexCentered>
                  <CheckCircleOutlined style={{ fontSize: '3rem', color: 'rgb(21, 168, 3)', marginBottom: '.5rem' }} />
                  <p>{t('runner-streaming:uploadSuccessMessage')}</p>
                </FlexCentered>
              ) : (
                <FlexCentered>
                  <ExclamationCircleOutlined style={{ fontSize: '3rem', color: '#f78a77', marginBottom: '.5rem' }} />
                  <p>{t('runner-streaming:uploadFailureMessage')}</p>
                </FlexCentered>
              )
            ) : (
              <div style={{ paddingTop: '.5rem' }}>
                <Steps
                  direction="vertical"
                  current={progress !== undefined ? 0 : isGathering ? 1 : 2}
                  items={[
                    {
                      title: t('runner-streaming:uploadApplicationUploadStatus'),
                      description: progress !== undefined ? <Progress type="line" percent={progress} /> : undefined,
                      icon: progress !== undefined ? <LoadingOutlined /> : undefined,
                    },
                    {
                      title: t('runner-streaming:uploadApplicationGatheringStatus'),
                      icon: isGathering ? <LoadingOutlined /> : undefined,
                    },
                    {
                      title: t('runner-streaming:uploadApplicationInstallingStatus'),
                      icon: isInstalling ? <LoadingOutlined /> : undefined,
                    },
                  ]}
                />
              </div>
            )}
          </div>
        </ApplicationInfoBox>
      )}
    </Box>
  );
};

export default ApplicationUploader;

const Box = styled.div`
  width: 100%;
  height: 100%;
`;

const StyledUpload = styled(Upload.Dragger)`
  display: block;
  max-height: 10rem;
  .ant-upload-list-item-progress {
    display: none !important;
  }
`;

const ApplicationInfoBox = styled.div`
  margin: 1rem 0;
`;

const FlexRow = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const Title = styled.p`
  font-weight: 700;
`;

const InfoContent = styled.div`
  margin-bottom: 0.5rem;
`;

const InfoTitle = styled.p`
  font-size: 0.8rem;
  font-weight: 500;
  color: #00000080;
`;

const FlexCentered = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
`;
