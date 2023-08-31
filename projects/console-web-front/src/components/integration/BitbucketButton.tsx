import { PROJECT_SCM_TYPE } from '@dogu-private/types';
import { Form, Modal } from 'antd';
import { isAxiosError } from 'axios';
import { shallow } from 'zustand/shallow';

import BitbucketIcon from 'public/resources/icons/bitbucket.svg';
import { deleteProjectScm, updateProjectScm } from '../../api/project';
import useModal from '../../hooks/useModal';
import useRequest from '../../hooks/useRequest';
import useEventStore from '../../stores/events';
import { ProjectIntegrationButtonProps } from '../../types/props';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import GitIntegrationForm from '../projects/GitIntegrationForm';
import IntegrationConnectButton from './ConnectButton';
import DisconnectButton from './DisconnectButton';
import IntegrationButton from './IntegrationCard';

interface Props extends ProjectIntegrationButtonProps {
  disabled: boolean;
  description?: React.ReactNode;
}

function BitbucketButton({ isConnected, disabled, organizationId, projectId, description }: Props) {
  const [deleteLoading, deleteScm] = useRequest(deleteProjectScm);
  const [saveLoading, saveScm] = useRequest(updateProjectScm);
  const [isOpen, openModal, closeModal] = useModal();
  const [form] = Form.useForm();
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);

  const disconnect = async () => {
    try {
      await deleteScm(organizationId, projectId);
      sendSuccessNotification('Bitbucket disconnected');
      fireEvent('onProjectScmUpdated');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification('Cannot disconnect Bitbucket');
      }
    }
  };

  const handleClose = () => {
    form.resetFields();
    closeModal();
  };

  const saveBitbucketIntegration = async () => {
    const values = await form.validateFields();

    try {
      await saveScm(organizationId, projectId, { service: PROJECT_SCM_TYPE.BITBUCKET, token: values.token, url: values.repo.replace('.git', '') });
      sendSuccessNotification('Bitbucket integration saved');
      fireEvent('onProjectScmUpdated');
      handleClose();
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification('Cannot save Bitbucket integration');
      }
    }
  };

  return (
    <>
      <IntegrationButton
        icon={<BitbucketIcon style={{ width: '24px', height: '24px' }} />}
        name="Bitbucket"
        description={description ?? 'Integrate routine with Bitbucket'}
        connectButton={
          isConnected ? (
            <DisconnectButton onClick={disconnect} loading={deleteLoading}>
              Disconnect
            </DisconnectButton>
          ) : (
            <IntegrationConnectButton isConnected={isConnected} disabled={disabled} onClick={() => openModal()} />
          )
        }
      />

      <Modal open={isOpen} centered closable onCancel={handleClose} okText={'Save'} onOk={saveBitbucketIntegration} confirmLoading={saveLoading} title="Bitbucket Integration">
        <GitIntegrationForm form={form} hideType />
      </Modal>
    </>
  );
}

export default BitbucketButton;
