import { DeviceBase } from '@dogu-private/console';
import { DEVICE_MAX_PARALLEL_JOBS_MAX, DEVICE_MAX_PARALLEL_JOBS_MIN, OrganizationId } from '@dogu-private/types';
import { Form, InputNumber, Modal } from 'antd';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { updateDevice } from '../../../src/api/device';
import useEventStore from '../../../src/stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../../src/utils/antd';
import { getErrorMessageFromAxios } from '../../../src/utils/error';

interface Props {
  device: DeviceBase;
  isOpen: boolean;
  close: () => void;
}

const HostDeviceRunnerSettingModal: React.FC<Props> = ({ device, isOpen, close }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ browser: number }>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;
  const fireEvent = useEventStore((state) => state.fireEvent);

  const handleSave = async () => {
    const { browser } = await form.validateFields();

    if (!browser) {
      return;
    }

    if (device.maxParallelJobs === browser) {
      close();
      return;
    }

    setLoading(true);
    try {
      // TODO
      sendSuccessNotification(t('device-farm:deviceSettingSuccessMsg'));
      fireEvent('onDeviceUpdated');
      close();
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(t('device-farm:deviceSettingFailureMsg', { message: getErrorMessageFromAxios(e) }));
      }
    }
    setLoading(false);
  };

  const handleClose = () => {
    form.resetFields();
    close();
  };

  return (
    <Modal
      title={t('device-farm:hostDeviceRunnerSettingModalTitle')}
      visible={isOpen}
      onCancel={handleClose}
      onOk={handleSave}
      confirmLoading={loading}
      okText={t('common:save')}
      cancelText={t('common:cancel')}
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={t('device-farm:hostDeviceRunnerSettingBrowserLabelText')}
          name="browser"
          rules={[
            {
              required: true,
              message: 'Required',
              transform(value) {
                return Number(value);
              },
              type: 'number',
              validator(_, value) {
                if (value < DEVICE_MAX_PARALLEL_JOBS_MIN || value > DEVICE_MAX_PARALLEL_JOBS_MAX) {
                  return Promise.reject(new Error('Max count should be 1 to 16'));
                }
                return Promise.resolve();
              },
            },
          ]}
          initialValue={device.maxParallelJobs}
        >
          <InputNumber
            placeholder={'Max count'}
            min={DEVICE_MAX_PARALLEL_JOBS_MIN}
            max={DEVICE_MAX_PARALLEL_JOBS_MAX}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HostDeviceRunnerSettingModal;
