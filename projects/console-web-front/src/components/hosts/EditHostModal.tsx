import { HostBase } from '@dogu-private/console';
import { OrganizationId, HOST_NAME_MAX_LENGTH, HOST_NAME_MIN_LENGTH } from '@dogu-private/types';
import { Input, Modal, notification } from 'antd';
import { AxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { updateHostName } from 'src/api/host';
import { getErrorMessage } from 'src/utils/error';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';

interface Props {
  host: HostBase;
  isOpen: boolean;
  close: () => void;
}

const EditHostModal = ({ host, isOpen, close }: Props) => {
  const [name, setName] = useState(host.name);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const organizationId = router.query.orgId as OrganizationId;
  const fireEvent = useEventStore((state) => state.fireEvent);

  const handleSave = async () => {
    if (!name || name.length < HOST_NAME_MIN_LENGTH) {
      return;
    }

    setLoading(true);
    try {
      await updateHostName(organizationId, host.hostId, { name });
      sendSuccessNotification(t('device-farm:hostEditSuccessMsg'));
      fireEvent('onHostUpdated');
      close();
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('device-farm:hostEditFailMsg', { reason: getErrorMessage(e) }));
      }
    }
    setLoading(false);
  };

  return (
    <Modal
      open={isOpen}
      centered
      title={t('device-farm:hostEditModalTitle')}
      closable
      onCancel={close}
      cancelText={t('common:cancel')}
      okText={t('common:save')}
      onOk={handleSave}
      confirmLoading={loading}
      okButtonProps={{
        accessKey: 'save-host-edit-modal',
      }}
    >
      <Input
        value={name ?? ''}
        placeholder={t('device-farm:hostEditNameInputPlaceholder')}
        onChange={(e) => setName(e.target.value)}
        minLength={HOST_NAME_MIN_LENGTH}
        maxLength={HOST_NAME_MAX_LENGTH}
      />
    </Modal>
  );
};

export default EditHostModal;
