import { DEVICE_MAX_PARALLEL_JOBS_MAX, DEVICE_MAX_PARALLEL_JOBS_MIN, OrganizationId } from '@dogu-private/types';
import { DEVICE_NAME_MAX_LENGTH, DEVICE_NAME_MIN_LENGTH } from '@dogu-private/types';
import { Form, Input, InputNumber, Modal } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { DeviceBase } from '@dogu-private/console';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';
import Trans from 'next-translate/Trans';

import H5 from 'src/components/common/headings/H5';
import { updateDevice } from 'src/api/device';
import { getErrorMessageFromAxios } from '../../utils/error';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { isDesktop } from '../../utils/device';

interface Props {
  isOpen: boolean;
  device: DeviceBase;
  close: () => void;
}

const DeviceSettingModal = ({ isOpen, device, close }: Props) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ name: string }>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;
  const fireEvent = useEventStore((state) => state.fireEvent);

  useEffect(() => {
    form.setFieldValue('name', device?.name ?? '');
  }, [device, form]);

  const handleSave = async () => {
    const { name } = await form.validateFields();

    if (!name) {
      return;
    }

    if (device.name === name) {
      close();
      return;
    }

    setLoading(true);
    try {
      await updateDevice(organizationId, device.deviceId, { name });
      sendSuccessNotification(t('device-farm:deviceSettingSuccessMsg'));
      fireEvent('onDeviceUpdated');
      close();
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device-farm:deviceSettingFailureMsg', { message: getErrorMessageFromAxios(e) }));
      }
    }
    setLoading(false);
  };

  return (
    <Modal
      open={isOpen}
      centered
      okText={t('common:save')}
      cancelText={t('common:cancel')}
      onCancel={close}
      confirmLoading={loading}
      onOk={handleSave}
      destroyOnClose
      okButtonProps={{ id: 'save-device-setting-btn' }}
    >
      <H5>{t('device-farm:deviceSettingModalTitle')}</H5>
      <FormContainer>
        <Form layout="vertical" form={form}>
          <Form.Item
            label={t('device-farm:deviceSettingNameLabelText')}
            name="name"
            required
            rules={[{ required: true, message: t('device-farm:deviceSettingNameRequiredMsg') }]}
            initialValue={device.name}
          >
            <Input
              type="text"
              placeholder={t('common:name')}
              maxLength={DEVICE_NAME_MAX_LENGTH}
              minLength={DEVICE_NAME_MIN_LENGTH}
            />
          </Form.Item>
        </Form>
      </FormContainer>
    </Modal>
  );
};

export default DeviceSettingModal;

const FormContainer = styled.div`
  margin-top: 1.5rem;
`;
