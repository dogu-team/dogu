import { DEVICE_TAG_NAME_MAX_LENGTHC, DEVICE_TAG_NAME_MIN_LENGTH } from '@dogu-private/types';
import { OrganizationId } from '@dogu-private/types';
import { Form, Input, message } from 'antd';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import { createTag } from 'src/api/tag';
import { getErrorMessageFromAxios } from 'src/utils/error';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import FormControlModal from '../modals/FormControlModal';

interface Props {
  close: () => void;
  isOpen: boolean;
}

const CreateTagModal = ({ isOpen, close }: Props) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const organizationId = router.query.orgId;
  const { t } = useTranslation();
  const fireEvent = useEventStore((state) => state.fireEvent);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
    } catch (e) {
      return;
    }

    const name = form.getFieldValue('name');

    if (!organizationId || !name) {
      return;
    }

    try {
      await createTag(organizationId as OrganizationId, { name });
      sendSuccessNotification(t('device-farm:tagCreateSuccessMsg'));
      fireEvent('onTagCreated');
      form.resetFields();
      close();
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device-farm:tagCreateFailMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  return (
    <FormControlModal
      title={t('device-farm:createTagModalTitle')}
      form={
        <Form form={form} id="new-tag" layout="vertical" preserve={false} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label={t('device-farm:createTagModalNameLabel')}
            required
            rules={[{ required: true, message: t('device-farm:createTagModalInputRuleErrorMsg') }]}
          >
            <Input
              placeholder={t('device-farm:createTagModalNamePlaceHolder')}
              required
              minLength={DEVICE_TAG_NAME_MIN_LENGTH}
              maxLength={DEVICE_TAG_NAME_MAX_LENGTHC}
            />
          </Form.Item>
        </Form>
      }
      close={close}
      open={isOpen}
      formId="new-tag"
      okText={t('common:add')}
      cancelText={t('common:cancel')}
      centered
    />
  );
};

export default CreateTagModal;
