import { OrganizationId } from '@dogu-private/types';
import { DEVICE_NAME_MAX_LENGTH, DEVICE_NAME_MIN_LENGTH } from '@dogu-private/types';
import { Form, Input, Modal, notification } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { DeviceBase } from '@dogu-private/console';
import { useRouter } from 'next/router';

import H5 from 'src/components/common/headings/H5';
import { updateDevice } from 'src/api/device';
import { AxiosError } from 'axios';
import { getErrorMessage } from '../../utils/error';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';

interface Props {
  isOpen: boolean;
  device: DeviceBase;
  close: () => void;
}

const EditDeviceModal = ({ isOpen, device, close }: Props) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;
  const fireEvent = useEventStore((state) => state.fireEvent);

  useEffect(() => {
    form.setFieldValue('name', device?.name ?? '');
  }, [device?.name, form]);

  const handleSave = async () => {
    const name: string = form.getFieldValue('name');

    if (!name || !device || device.name === name) {
      return;
    }

    setLoading(true);
    try {
      await updateDevice(organizationId, device.deviceId, { name });
      sendSuccessNotification(t('device:runnerEditSuccessMsg'));
      fireEvent('onDeviceUpdated');
      close();
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device:runnerEditFailureMsg', { message: getErrorMessage(e) }));
      }
    }
    setLoading(false);
  };

  return (
    <Modal open={isOpen} centered okText={t('common:save')} cancelText={t('common:cancel')} onCancel={close} confirmLoading={loading} onOk={handleSave} destroyOnClose>
      <H5>{t('device:runnerEditModalTitle')}</H5>
      <FormContainer>
        <Form layout="vertical" form={form}>
          <Form.Item
            label={t('device:runnerEditNameLabelText')}
            name="name"
            required
            rules={[{ required: true, message: t('device:runnerEditNameRequiredMsg') }]}
            initialValue={device?.name}
          >
            <Input type="text" placeholder={t('common:name')} maxLength={DEVICE_NAME_MAX_LENGTH} minLength={DEVICE_NAME_MIN_LENGTH} />
          </Form.Item>
        </Form>
      </FormContainer>
    </Modal>
  );
};

export default EditDeviceModal;

const FormContainer = styled.div`
  margin-top: 1.5rem;
`;
