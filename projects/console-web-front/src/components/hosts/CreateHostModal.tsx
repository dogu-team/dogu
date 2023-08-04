import { CreateHostDtoBase } from '@dogu-private/console';
import { OrganizationId, HOST_NAME_MAX_LENGTH, HOST_NAME_MIN_LENGTH } from '@dogu-private/types';
import { Alert, Button, Form, Input, message, notification } from 'antd';
import { AxiosError } from 'axios';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { createHost } from 'src/api/host';
import useResultAlert from 'src/hooks/useAlert';
import useEventStore from 'src/stores/events';
import { getErrorMessage } from 'src/utils/error';
import { flexRowBaseStyle } from '../../styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import FormControlModal from '../modals/FormControlModal';
import TokenCopyInput from '../common/TokenCopyInput';
import { getLocaledLink } from '../../utils/locale';

interface Props {
  isOpen: boolean;
  close: () => void;
}

const CreateHostModal = ({ isOpen, close }: Props) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, showAlert, closeAlert] = useResultAlert();
  const fireEvent = useEventStore((state) => state.fireEvent);
  const router = useRouter();

  const organizationId = router.query.orgId as OrganizationId;

  useEffect(() => {
    if (!isOpen) {
      closeAlert();
    }
  }, [isOpen, closeAlert]);

  const handleSubmit = async () => {
    const name = form.getFieldValue('name');
    const createHostBody: CreateHostDtoBase = { name };

    setLoading(true);
    try {
      const hostToken = await createHost(organizationId, createHostBody);
      form.resetFields();
      sendSuccessNotification(t('device-farm:newHostSuccessTitle', { name }));
      showAlert(true, String(hostToken));
      fireEvent('onHostCreated', hostToken);
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device-farm:newHostFailTitle', { name, reason: getErrorMessage(e) }));
      }
    }
    setLoading(false);
  };

  const doguAgentDownloadLink =
    process.env.NEXT_PUBLIC_ENV === 'self-hosted'
      ? 'https://github.com/dogu-team/dogu/releases'
      : `${process.env.NEXT_PUBLIC_LANDING_URL}${getLocaledLink(router.locale, '/downloads/dogu-agent')}`;

  return (
    <FormControlModal
      form={
        <>
          {result.isOpen ? (
            <div>
              <Alert
                type={'success'}
                message={
                  <div style={{ lineHeight: '1.4', marginRight: '.25rem' }}>
                    <p>
                      <Trans
                        i18nKey="device-farm:hostCreateModalSuccessHint"
                        components={{
                          link1: <Link href={doguAgentDownloadLink} target="_blank" />,
                          link2: <Link href="https://docs.dogutech.io/device-farm/host" target="_blank" />,
                        }}
                      />
                    </p>
                  </div>
                }
                showIcon
                {...(process.env.NEXT_PUBLIC_ENV !== 'production' ? { 'access-id': 'add-host-result' } : {})}
              />

              <div style={{ marginTop: '1rem' }}>
                <p style={{ flexShrink: 0, marginRight: '.25rem' }}>{t('device-farm:hostCreateModalTokenDescription')}</p>
                <TokenCopyInput value={result.message} />
                <p style={{ fontSize: '.8rem', lineHeight: '1.4' }}>* {t('device-farm:hostCreateModalTokenCheckDescription')}</p>
              </div>
            </div>
          ) : (
            <Form form={form} id="new-host" layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="name" label={t('device-farm:newHostModalInputName')} rules={[{ required: true, message: t('common:nameInputEmptyError') }]}>
                <Input
                  type="text"
                  placeholder={t('common:name')}
                  required
                  minLength={HOST_NAME_MIN_LENGTH}
                  maxLength={HOST_NAME_MAX_LENGTH}
                  {...(process.env.NEXT_PUBLIC_ENV !== 'production' ? { 'access-id': 'add-host-form-name' } : {})}
                />
              </Form.Item>
            </Form>
          )}
        </>
      }
      formId="new-host"
      open={isOpen}
      close={() => {
        close();
        closeAlert();
      }}
      centered
      okText={t('common:add')}
      cancelText={t('common:cancel')}
      title={t('device-farm:addNewHost')}
      confirmLoading={loading}
      footer={result.isOpen ? null : undefined}
      destroyOnClose
    />
  );
};

export default CreateHostModal;

const FlexRowBox = styled.div`
  ${flexRowBaseStyle}
`;
