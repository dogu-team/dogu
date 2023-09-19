import { DeviceBase } from '@dogu-private/console';
import { DEVICE_MAX_PARALLEL_JOBS_MAX, DEVICE_MAX_PARALLEL_JOBS_MIN, OrganizationId } from '@dogu-private/types';
import { Form, InputNumber, Modal } from 'antd';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useState } from 'react';

import useModal from '../../../src/hooks/useModal';
import useEventStore from '../../../src/stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../../src/utils/antd';
import { getErrorMessageFromAxios } from '../../../src/utils/error';
import { updateDeviceMaxParallelCount } from '../../api/device';
import { isPaymentRequired, isTimeout } from '../../utils/error';
import TimeoutDocsModal from '../license/TimeoutDocsModal';
import { UpgradeBrowserPlanModal } from '../license/UpgradePlanBannerModal';

interface Props {
  device: DeviceBase;
  isOpen: boolean;
  close: () => void;
}

const HostDeviceRunnerSettingModal: React.FC<Props> = ({ device, isOpen, close }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ browser: number }>();
  const [loading, setLoading] = useState(false);
  const [isBannerOpen, openBanner, closeBanner] = useModal();
  const [isDocsOtpen, openDocs, closeDocs] = useModal();
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
      await updateDeviceMaxParallelCount(organizationId, device.deviceId, { maxParallelJobs: browser });
      sendSuccessNotification(t('device-farm:deviceSettingSuccessMsg'));
      fireEvent('onDeviceUpdated');
      close();
    } catch (e) {
      if (isAxiosError(e)) {
        if (isPaymentRequired(e)) {
          handleClose();
          openBanner();
        } else if (isTimeout(e)) {
          handleClose();
          openDocs();
        } else {
          sendErrorNotification(t('device-farm:deviceSettingFailureMsg', { message: getErrorMessageFromAxios(e) }));
        }
      }
    }
    setLoading(false);
  };

  const handleClose = () => {
    form.resetFields();
    close();
  };

  return (
    <>
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
        okButtonProps={{
          id: 'host-device-runner-setting-submit-btn',
        }}
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

      <UpgradeBrowserPlanModal
        isOpen={isBannerOpen}
        close={closeBanner}
        title={t('license:addHostDeviceModalTitle')}
        description={null}
      />
      <TimeoutDocsModal isOpen={isDocsOtpen} close={closeDocs} />
    </>
  );
};

export default HostDeviceRunnerSettingModal;
