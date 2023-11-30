import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  LoadingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { OrganizationApplicationWithIcon, PageBase } from '@dogu-private/console';
import { OrganizationId, Platform } from '@dogu-private/types';
import { Button, Divider, Progress, Steps, Upload } from 'antd';
import moment from 'moment';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useDeviceAppInstall from '../../hooks/streaming/useDeviceAppInstall';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { flexRowCenteredStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
import { buildQueryPraramsByObject } from '../../utils/query';
import { getAvailableApplicationExtension } from '../../utils/streaming/streaming';
import { convertByteWithMaxUnit } from '../../utils/unit';
import OrganizationApplicationLatestTag from '../organization-application/OrganizationApplicationLatestTag';

interface Props {}

const ApplicationUploader = ({}: Props) => {
  const router = useRouter();
  const { device, deviceService, loading, isCloudDevice } = useDeviceStreamingContext();
  const { uploadAndInstallApp, installApp, isInstalling, progress, app, result } = useDeviceAppInstall(
    device?.serial,
    deviceService?.deviceHostClientRef,
    deviceService?.deviceClientRef,
    { isCloudDevice: isCloudDevice ?? false },
  );
  const { t } = useTranslation();
  const [mode, setMode] = useState<'app-list' | 'upload'>('app-list');
  const [selectedPackage, setSelectedPackage] = useState<string>();

  const availableExtension = getAvailableApplicationExtension(device?.platform ?? Platform.UNRECOGNIZED);
  const query = buildQueryPraramsByObject({
    offset: 99,
    extension: availableExtension.slice(1),
  });
  const { data: appPackages, isLoading: isAppPackagesLoading } = useSWR<PageBase<OrganizationApplicationWithIcon>>(
    `/organizations/${router.query.orgId}/applications/packages?${query}`,
    swrAuthFetcher,
  );
  const { data: apps, isLoading: appsLoading } = useSWR<PageBase<OrganizationApplicationWithIcon>>(
    `/organizations/${router.query.orgId}/applications/packages/${selectedPackage}`,
    swrAuthFetcher,
  );

  const shouldUpload = mode === 'upload' || !appPackages?.items.length;

  return (
    <Box>
      <div style={{ marginTop: '.5rem' }}>
        {shouldUpload ? (
          <div>
            <StyledUpload
              name="app"
              accept={availableExtension}
              customRequest={async (option) => {
                await uploadAndInstallApp(router.query.orgId as OrganizationId, option.file as File);
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
              <p className="ant-upload-text" style={{ fontSize: '.8rem' }}>
                {t('device-streaming:uploadApplicationDescription')}
              </p>
              <p className="ant-upload-hint" style={{ fontSize: '.8rem' }}>
                {t('device-streaming:uploadApplicationHint', { extension: availableExtension })}
              </p>
            </StyledUpload>
          </div>
        ) : (
          <div>
            {selectedPackage && (
              <BackButton
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPackage(undefined);
                }}
              >
                <ArrowLeftOutlined style={{ marginRight: '.25rem' }} /> Back
              </BackButton>
            )}
            {selectedPackage
              ? apps?.items.map((app) => {
                  return (
                    <StyledButton
                      key={app.organizationApplicationId}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await installApp(app);
                      }}
                      style={{
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Image
                          src={app.iconUrl}
                          width={16}
                          height={16}
                          alt={app.name}
                          style={{ marginRight: '.25rem' }}
                        />
                        <div>
                          <p style={{ textAlign: 'left' }}>
                            v{app.version}
                            <span style={{ fontSize: '.9em', color: '#888' }}>(Build {app.versionCode})</span>
                          </p>
                          <p style={{ fontSize: '.85em', color: '#888', textAlign: 'left' }}>
                            {new Intl.DateTimeFormat(router.locale, {
                              year: 'numeric',
                              month: 'numeric',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                              second: 'numeric',
                            }).format(moment(app.createdAt).toDate())}
                          </p>
                        </div>
                      </div>
                      {app.isLatest && <OrganizationApplicationLatestTag style={{ marginRight: '0' }} />}
                    </StyledButton>
                  );
                })
              : appPackages?.items.map((app) => {
                  return (
                    <StyledButton
                      key={app.organizationApplicationId}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPackage(app.package);
                      }}
                    >
                      <Image
                        src={app.iconUrl}
                        width={20}
                        height={20}
                        alt={app.name}
                        style={{ marginRight: '.25rem' }}
                      />
                      {app.package}
                    </StyledButton>
                  );
                })}
          </div>
        )}
      </div>
      <Divider plain style={{ color: '#a9a9a9', fontSize: '.7rem', margin: '.25rem 0' }}>
        OR
      </Divider>
      <Button
        icon={mode === 'app-list' ? <UploadOutlined /> : <AppstoreOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          setMode((prev) => (prev === 'app-list' ? 'upload' : 'app-list'));
        }}
        size="small"
        style={{ width: '100%' }}
      >
        {mode === 'app-list' ? 'Upload' : 'My Apps'}
      </Button>
      {app && (
        <ApplicationInfoBox>
          <FlexRow>
            <Title>{t('device-streaming:uploadApplicationAppInfo')}</Title>
          </FlexRow>
          <InfoContent>
            <InfoTitle>{t('device-streaming:uploadApplicationName')}</InfoTitle>
            <p>{app.name}</p>
          </InfoContent>
          <InfoContent>
            <InfoTitle>{t('device-streaming:uploadApplicationSize')}</InfoTitle>
            <p>{convertByteWithMaxUnit((app as OrganizationApplicationWithIcon).fileSize || (app as File).size)}</p>
          </InfoContent>
          <div>
            <InfoTitle>{t('device-streaming:uploadApplicationStatus')}</InfoTitle>
            {result ? (
              result.isSuccess ? (
                <FlexCentered>
                  <CheckCircleOutlined style={{ fontSize: '3rem', color: 'rgb(21, 168, 3)', marginBottom: '.5rem' }} />
                  <p>{t('device-streaming:uploadSuccessMessage')}</p>
                </FlexCentered>
              ) : (
                <FlexCentered>
                  <ExclamationCircleOutlined style={{ fontSize: '3rem', color: '#f78a77', marginBottom: '.5rem' }} />
                  <p>
                    {result.failType === 'upload'
                      ? t('device-streaming:uploadTransferFailureMessage')
                      : t('device-streaming:uploadInstallFailureMessage')}
                  </p>
                </FlexCentered>
              )
            ) : (
              <div style={{ paddingTop: '.5rem' }}>
                <Steps
                  direction="vertical"
                  current={progress !== undefined ? 0 : 1}
                  items={[
                    {
                      title: t('device-streaming:uploadApplicationUploadStatus'),
                      description: progress !== undefined ? <Progress type="line" percent={progress} /> : undefined,
                      icon: progress !== undefined ? <LoadingOutlined /> : undefined,
                    },
                    {
                      title: t('device-streaming:uploadApplicationInstallingStatus'),
                      icon: isInstalling ? <LoadingOutlined /> : undefined,
                    },
                  ]}
                />
              </div>
            )}
          </div>
        </ApplicationInfoBox>
      )}
      {isAppPackagesLoading && (
        <LoadingBox>
          <LoadingOutlined />
        </LoadingBox>
      )}
    </Box>
  );
};

export default ApplicationUploader;

const Box = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 10rem;
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

const StyledButton = styled.button`
  display: flex;
  padding: 0.25rem 0.5rem;
  color: #000000;
  width: 100%;
  min-width: 14rem;
  background-color: #ffffff;
  font-size: 0.8rem;
  cursor: pointer;
  align-items: center;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const LoadingBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  ${flexRowCenteredStyle}
`;

const BackButton = styled.button`
  display: flex;
  margin-bottom: 0.25rem;
  align-items: center;
  font-size: 0.8rem;
  background-color: #ffffff;

  &:hover {
    text-decoration: underline;
  }
`;
