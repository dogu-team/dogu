import { ExclamationCircleOutlined } from '@ant-design/icons';
import { OrganizationId } from '@dogu-private/types';
import { Alert, Button, Form, Input, Space, Tag } from 'antd';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import Trans from 'next-translate/Trans';
import {
  COMMUNITY_MAX_BROWSER_COUNT,
  COMMUNITY_MAX_MOBILE_COUNT,
  SelfHostedLicenseResponse,
} from '@dogu-private/console';

import DangerZone from '../../../src/components/common/boxes/DangerZone';
import TokenCopyInput from '../../../src/components/common/TokenCopyInput';
import useModal from '../../../src/hooks/useModal';
import { sendErrorNotification, sendSuccessNotification } from '../../../src/utils/antd';
import { getErrorMessageFromAxios } from '../../../src/utils/error';
import { registerSelfHostedLicense } from '../../api/license';
import { checkCommunityEdition, checkExpired, LICENSE_DOCS_URL } from '../../utils/license';
import { isTimeout } from '../../utils/error';
import ProTag from '../common/ProTag';
import LicenseSubmitForm, { LicenseSubmitFormValues } from './LicenseSubmitForm';
import TimeoutDocsModal from './TimeoutDocsModal';
import useEventStore from '../../../src/stores/events';
import DoguText from '../../../src/components/common/DoguText';

interface Props {
  license: SelfHostedLicenseResponse;
  organizationId: OrganizationId | null;
}

const SelfHostedLicenseContainer: React.FC<Props> = ({ license, organizationId }) => {
  const [licenseInfo, setLicenseInfo] = useState<SelfHostedLicenseResponse>(license);
  const [isTimeoutOpen, openTimeoutModal, closeTimeoutModal] = useModal();
  const [form] = Form.useForm<LicenseSubmitFormValues>();
  const router = useRouter();
  const { t } = useTranslation('billing');
  const fireEvent = useEventStore((state) => state.fireEvent);

  const isExpired = checkExpired(licenseInfo);
  // const hasError = isExpired || licenseInfo.errorInfo !== null;
  const isCommunityEdition = checkCommunityEdition(licenseInfo);

  useEffect(() => {
    setLicenseInfo(license);
  }, [license]);

  const handleSubmit = async (licenseKey: string) => {
    try {
      if (!organizationId) {
        const rv = await registerSelfHostedLicense({ licenseKey });
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

  const getTypeText = (): React.ReactNode => {
    if (organizationId) {
    } else {
      if (isCommunityEdition) {
        return 'Community Edition';
      } else {
        return (
          <>
            <ProTag style={{ marginRight: '.25rem' }} />
            {`Professional (Max browsers: ${
              licenseInfo.maximumEnabledBrowserCount ?? COMMUNITY_MAX_BROWSER_COUNT
            } / Max devices: ${licenseInfo.maximumEnabledMobileCount ?? COMMUNITY_MAX_MOBILE_COUNT})`}
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
          {/* {licenseInfo.errorInfo !== null && <LicenseErrorAlert errorInfo={licenseInfo.errorInfo} />} */}
        </div>
        {isCommunityEdition ? (
          <>
            <LicenseSubmitForm form={form} onSubmit={handleSubmit} />
            <Alert
              message={t('needHelpAlertMessage')}
              action={
                <Space direction="vertical">
                  <Button size="small" style={{ width: '100%' }} href={LICENSE_DOCS_URL} target="_blank">
                    {t('visitGuide')}
                  </Button>

                  <Button
                    size="small"
                    style={{ width: '100%' }}
                    href={`${process.env.NEXT_PUBLIC_LANDING_URL}/contact-us`}
                    target="_blank"
                  >
                    {t('contactUs')}
                  </Button>
                </Space>
              }
            />
          </>
        ) : (
          <TokenCopyInput
            value={licenseInfo?.licenseKey}
            // status={hasError ? 'error' : undefined}
            // suffix={hasError ? <ExclamationCircleOutlined style={{ color: 'red' }} /> : undefined}
          />
        )}
      </Content>
      {!isCommunityEdition && licenseInfo.createdAt && (
        <Content>
          <ContentTitle>{t('licenseActivatedDate')}</ContentTitle>
          <ContentValue>
            {new Date(licenseInfo.createdAt).toLocaleDateString(router.locale, {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </ContentValue>
        </Content>
      )}
      {!isCommunityEdition && licenseInfo.expiredAt && (
        <Content>
          <ContentTitle>{t('licenseExpirationDate')}</ContentTitle>
          <ContentValue>
            {new Date(licenseInfo.expiredAt).toLocaleDateString(router.locale, {
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
            description={<Trans i18nKey="billing:renewLicenseKeyMenuDescription" components={{ dogu: <DoguText /> }} />}
            button={
              <DangerZone.Button
                modalTitle={t('renewLicenseKeyModalTitle')}
                modalContent={
                  <div>
                    <p>{t('renewLicenseKeyModalDescription')}</p>

                    <div style={{ marginTop: '1rem' }}>
                      <Form<LicenseSubmitFormValues> id="re-register-key" form={form} layout="vertical">
                        <Form.Item
                          name="key"
                          label={t('licenseActivateFormKeyLabel')}
                          rules={[{ required: true, message: 'Input key' }]}
                        >
                          <Input
                            placeholder={t('licenseActivateFormKeyInputPlaceholder')}
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
                  await handleSubmit(key);
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

export default SelfHostedLicenseContainer;

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
