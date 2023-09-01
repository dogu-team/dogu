import { PROJECT_SCM_TYPE } from '@dogu-private/types';
import { Form, Modal } from 'antd';
import { isAxiosError } from 'axios';
import { shallow } from 'zustand/shallow';
import Link from 'next/link';

import GithubIcon from 'public/resources/icons/github.svg';
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

function GithubButton({ isConnected, disabled, organizationId, projectId, description }: Props) {
  const [deleteLoading, deleteScm] = useRequest(deleteProjectScm);
  const [saveLoading, saveScm] = useRequest(updateProjectScm);
  const [isOpen, openModal, closeModal] = useModal();
  const [form] = Form.useForm();
  const fireEvent = useEventStore((state) => state.fireEvent, shallow);

  const disconnect = async () => {
    try {
      await deleteScm(organizationId, projectId);
      sendSuccessNotification('GitHub disconnected');
      fireEvent('onProjectScmUpdated');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification('Cannot disconnect GitHub');
      }
    }
  };

  const handleClose = () => {
    form.resetFields();
    closeModal();
  };

  const saveGitHubIntegration = async () => {
    const values = await form.validateFields();

    try {
      await saveScm(organizationId, projectId, { service: PROJECT_SCM_TYPE.GITHUB, token: values.token, url: values.repo.replace('.git', '') });
      sendSuccessNotification('GitHub integration saved');
      fireEvent('onProjectScmUpdated');
      handleClose();
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification('Cannot save GitHub integration');
      }
    }
  };

  return (
    <>
      <IntegrationButton
        icon={<GithubIcon style={{ width: '24px', height: '24px' }} />}
        name="GitHub"
        description={
          description ??
          (disabled ? null : (
            <>
              Integrate routine with GitHub.{' '}
              <Link href="https://docs.dogutech.io/management/project/git-integration/github" target="_blank">
                Visit docs
              </Link>
            </>
          ))
        }
        connectButton={
          isConnected ? (
            <DisconnectButton
              modalTitle={'Disconnect with GitHub'}
              modalContent={<p>Are you sure you want to disconnect with GitHub?</p>}
              modalButtonTitle={'Confirm & disconnect'}
              onConfirm={disconnect}
              loading={deleteLoading}
            >
              Disconnect
            </DisconnectButton>
          ) : (
            <IntegrationConnectButton isConnected={isConnected} disabled={disabled} onClick={() => openModal()} />
          )
        }
      />

      <Modal open={isOpen} centered closable onCancel={handleClose} okText={'Save'} onOk={saveGitHubIntegration} confirmLoading={saveLoading} title="GitHub Integration">
        <GitIntegrationForm form={form} hideType />
      </Modal>
    </>
  );
}

export default GithubButton;
