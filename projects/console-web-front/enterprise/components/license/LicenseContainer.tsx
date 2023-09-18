import { ExclamationCircleOutlined } from '@ant-design/icons';
import { LicenseResponse } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Alert, Button, Form, Input, Space, Tag } from 'antd';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import Trans from 'next-translate/Trans';

import DangerZone from '../../../src/components/common/boxes/DangerZone';
import TokenCopyInput from '../../../src/components/common/TokenCopyInput';
import useModal from '../../../src/hooks/useModal';
import { sendErrorNotification, sendSuccessNotification } from '../../../src/utils/antd';
import { getErrorMessageFromAxios } from '../../../src/utils/error';
import { registerSelfHostedLicense, reRegisterSelfHostedLicense } from '../../api/license';
import {
  checkCommunityEdition,
  checkExpired,
  COMMUNITY_MAX_BROWSER_COUNT,
  COMMUNITY_MAX_MOBILE_COUNT,
} from '../../utils/license';
import { isTimeout } from '../../utils/error';
import ProTag from '../common/ProTag';
import LicenseSubmitForm, { LicenseSubmitFormValues } from './LicenseSubmitForm';
import TimeoutDocsModal from './TimeoutDocsModal';
import useEventStore from '../../../src/stores/events';
import DoguText from '../../../src/components/common/DoguText';
import LicenseErrorAlert from './LicenseErrorAlert';

interface Props {
  license: LicenseResponse;
  organizationId: OrganizationId | null;
}

const LicenseContainer: React.FC<Props> = ({ license, organizationId }) => {
  const [licenseInfo, setLicenseInfo] = useState<LicenseResponse>(license);
  const [isTimeoutOpen, openTimeoutModal, closeTimeoutModal] = useModal();
  const [form] = Form.useForm<LicenseSubmitFormValues>();
  const router = useRouter();
  const { t } = useTranslation('license');
  const fireEvent = useEventStore((state) => state.fireEvent);

  const isExpired = checkExpired(licenseInfo);
  const hasError = isExpired || licenseInfo.errorInfo !== null;

  useEffect(() => {
    setLicenseInfo(license);
  }, [license]);

  const handleSubmit = async (licenseKey: string) => {
    try {
      if (!organizationId) {
        const rv = await registerSelfHostedLicense({ licenseToken: licenseKey });
        setLicenseInfo(rv);
        fireEvent('onLicenseUpdated', rv);
      } else {
        // TODO: cloud license register
      }
      sendSuccessNotification('Successfully registered license');
    } catch (e) {
      if (isAxiosError(e)) {
        if (isTimeout(e)) {
          openTimeoutModal();
        } else {
          sendErrorNotification(`Failed to register license: ${getErrorMessageFromAxios(e)}`);
        }
      }
    }
  };

  const handleReRegister = async (licenseKey: string) => {
    try {
      if (!organizationId) {
        const rv = await reRegisterSelfHostedLicense({ licenseToken: licenseKey });
        setLicenseInfo(rv);
        fireEvent('onLicenseUpdated', rv);
      } else {
        // TODO: cloud license register
      }
      sendSuccessNotification('Successfully re-registered license');
    } catch (e) {
      if (isAxiosError(e)) {
        if (isTimeout(e)) {
          openTimeoutModal();
        } else {
          sendErrorNotification(`Failed to re-register license: ${getErrorMessageFromAxios(e)}`);
        }
      }
    }
  };

  const getTypeText = (): React.ReactNode => {
    if (organizationId) {
    } else {
      if (checkCommunityEdition(licenseInfo)) {
        return 'Community Edition';
      } else {
        return (
          <>
            <ProTag style={{ marginRight: '.25rem' }} warnging={licenseInfo?.errorInfo !== null} />
            {`Professional (Max browsers: ${
              licenseInfo.licenseTier?.enabledBrowserCount ?? COMMUNITY_MAX_BROWSER_COUNT
            } / Max devices: ${licenseInfo.licenseTier?.enabledMobileCount ?? COMMUNITY_MAX_MOBILE_COUNT})`}
          </>
        );
      }
    }
  };

  return (
    <Box>
      <Content>
        <ContentTitle>{t('licenseType')}</ContentTitle>
        <ContentValue>
          {isExpired && (
            <Tag icon={<ExclamationCircleOutlined />} color="error">
              {t('licenseExpiredText')}
            </Tag>
          )}
          {getTypeText()}
        </ContentValue>
      </Content>
      <Content>
        <ContentTitle>{t('licenseKey')}</ContentTitle>
        <div style={{ marginBottom: '1rem' }}>
          {isExpired && <Alert type="error" showIcon message={t('licenseExpiredAlertMessage')} />}
          {licenseInfo.errorInfo !== null && <LicenseErrorAlert errorInfo={licenseInfo.errorInfo} />}
        </div>
        {licenseInfo?.consoleRegisteredToken ? (
          <TokenCopyInput
            value={licenseInfo?.consoleRegisteredToken}
            status={hasError ? 'error' : undefined}
            suffix={hasError ? <ExclamationCircleOutlined style={{ color: 'red' }} /> : undefined}
          />
        ) : (
          <>
            <LicenseSubmitForm form={form} onSubmit={handleSubmit} />
            <Alert
              message={t('needHelpAlertMessage')}
              action={
                <Space direction="vertical">
                  <Button size="small" style={{ width: '100%' }} href="https://docs.dogutech.io" target="_blank">
                    {t('visitGuide')}
                  </Button>

                  <Button
                    size="small"
                    style={{ width: '100%' }}
                    href={`${process.env.NEXT_PUBLIC_LANDING_URL}/pricing`}
                    target="_blank"
                  >
                    {t('contactUs')}
                  </Button>
                </Space>
              }
            />
          </>
        )}
      </Content>
      {licenseInfo.licenseToken?.createdAt && (
        <Content>
          <ContentTitle>{t('licenseActivatedDate')}</ContentTitle>
          <ContentValue>
            {new Date(licenseInfo.licenseToken.createdAt).toLocaleDateString(router.locale, {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </ContentValue>
        </Content>
      )}
      {licenseInfo.licenseToken?.expiredAt && (
        <Content>
          <ContentTitle>{t('licenseExpirationDate')}</ContentTitle>
          <ContentValue>
            {new Date(licenseInfo.licenseToken.expiredAt).toLocaleDateString(router.locale, {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </ContentValue>
        </Content>
      )}

      <div style={{ marginTop: '3rem' }}>
        <DangerZone>
          <DangerZone.Item
            title={t('renewLicenseKeyMenuTitle')}
            description={<Trans i18nKey="license:renewLicenseKeyMenuDescription" components={{ dogu: <DoguText /> }} />}
            button={
              <DangerZone.Button
                modalTitle={t('renewLicenseKeyModalTitle')}
                modalContent={
                  <div>
                    <p>{t('renewLicenseKeyModalDescription')}</p>

                    <div style={{ marginTop: '1rem' }}>
                      <Form<LicenseSubmitFormValues> id="re-register-key" form={form} layout="vertical">
                        <Form.Item name="key" label="License" rules={[{ required: true, message: 'Input key' }]}>
                          <Input
                            placeholder="License Key"
                            autoComplete="off"
                            autoCorrect="off"
                            minLength={1}
                            maxLength={256}
                          />
                        </Form.Item>
                      </Form>
                    </div>
                  </div>
                }
                onConfirm={async () => {
                  const { key } = await form.validateFields();
                  await handleReRegister(key);
                }}
                onOpenChange={(open) => {
                  if (!open) {
                    form.resetFields();
                  }
                }}
                buttonProps={{
                  form: 're-register-key',
                }}
                modalButtonTitle={t('renewLicenseKeyModalConfirmButtonTitle')}
              >
                {t('renewLicenseKeyMenuButtonTitle')}
              </DangerZone.Button>
            }
          />
        </DangerZone>
      </div>

      <TimeoutDocsModal isOpen={isTimeoutOpen} close={closeTimeoutModal} />
    </Box>
  );
};

export default LicenseContainer;

const Box = styled.div``;

const Content = styled.div`
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const ContentTitle = styled.span`
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const ContentValue = styled.div`
  font-size: 0.875rem;
`;
