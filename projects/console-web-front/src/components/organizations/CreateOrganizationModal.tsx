import { ORGANIZATION_NAME_MAX_LENGTH, ORGANIZATION_NAME_MIN_LENGTH } from '@dogu-private/types';
import { Form, Input } from 'antd';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { createOrganization } from '../../api/organization';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessage } from '../../utils/error';
import FormControlModal from '../modals/FormControlModal';

interface Props {
  open: boolean;
  close: () => void;
}

const CreateOrganizationModal = ({ open, close }: Props) => {
  const [form] = Form.useForm();
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    form.resetFields();
    close();
  };

  const handleSubmit = async () => {
    const name = form.getFieldValue('name');

    if (!name) {
      return;
    }

    setLoading(true);
    try {
      const organization = await createOrganization({ name });
      sendSuccessNotification(t('account:createOrganizationSuccessMessage'));
      fireEvent('onOrganizationCreated');
      handleClose();
      router.push(`/dashboard/${organization.organizationId}`);
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('account:createOrganizationFailureMessage', { reason: getErrorMessage(e) }));
      }
    }
    setLoading(false);
  };

  return (
    <FormControlModal
      form={
        <Form id="new-org" layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label={t('account:createOrganizaitonNameLabelText')}
            name="name"
            required
            rules={[{ required: true, message: t('account:createOrganizationNaameInputErrorMesssage') }]}
          >
            <Input placeholder={t('account:createOrganizationNameInputPlaceholder')} maxLength={ORGANIZATION_NAME_MAX_LENGTH} minLength={ORGANIZATION_NAME_MIN_LENGTH} />
          </Form.Item>
        </Form>
      }
      formId="new-org"
      open={open}
      title={t('account:createOrganizationModalTitle')}
      centered
      close={handleClose}
      closable
      destroyOnClose
      cancelText={t('common:cancel')}
      okText={t('common:add')}
      confirmLoading={loading}
    />
  );
};

export default CreateOrganizationModal;
