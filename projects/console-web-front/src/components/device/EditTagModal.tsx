import { DeviceTagBase } from '@dogu-private/console';
import { OrganizationId, DEVICE_TAG_NAME_MAX_LENGTHC, DEVICE_TAG_NAME_MIN_LENGTH } from '@dogu-private/types';
import { Form, Input, notification } from 'antd';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { updateTag } from '../../api/tag';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessage } from '../../utils/error';
import FormControlModal from '../modals/FormControlModal';

interface Props {
  tag: DeviceTagBase;
  isOpen: boolean;
  closeModal: () => void;
}

const EditTagModal = ({ tag, isOpen, closeModal }: Props) => {
  const router = useRouter();
  const orgId = router.query.orgId as OrganizationId;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      form.setFieldValue('name', tag.name);
    }
  }, [isOpen, form, tag]);

  const handleSubmit = async () => {
    const name: string = form.getFieldValue('name');
    setLoading(true);

    try {
      await updateTag(orgId, tag.deviceTagId, { name });
      sendSuccessNotification(t('device:editTagSuccessMsg'));
      fireEvent('onTagEdited');
      closeModal();
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device:editTagFailureMsg', { reason: getErrorMessage(e) }));
      }
    }

    setLoading(false);
  };

  return (
    <FormControlModal
      centered
      open={isOpen}
      closable
      title={t('device:editTagModalTitle')}
      form={
        <Form id="edit-device-tag" layout="vertical" preserve={false} onFinish={handleSubmit} form={form}>
          <Form.Item label={t('device:editTagNameLabel')} name="name" required rules={[{ required: true, message: t('device:editTagEmptyNameErrorMsg') }]}>
            <Input placeholder={t('device:editTagNameInputPlaceholer')} minLength={DEVICE_TAG_NAME_MIN_LENGTH} maxLength={DEVICE_TAG_NAME_MAX_LENGTHC} defaultValue={tag.name} />
          </Form.Item>
        </Form>
      }
      formId="edit-device-tag"
      close={closeModal}
      confirmLoading={loading}
      cancelText={t('common:cancel')}
      okText={t('common:save')}
    />
  );
};

export default EditTagModal;
