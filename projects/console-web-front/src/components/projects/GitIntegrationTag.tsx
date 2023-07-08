import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Form, Modal, Tag, Tooltip } from 'antd';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { updateProjectScm } from '../../api/project';
import useModal from '../../hooks/useModal';
import useRequest from '../../hooks/useRequest';
import useGitIntegrationStore from '../../stores/git-integration';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import GitIntegrationForm, { GitIntegrationFormValues } from './GitIntegrationForm';

interface Props {
  isGitIntegrated: boolean;
}

const GitIntegrationTag = ({ isGitIntegrated }: Props) => {
  const store = useGitIntegrationStore();
  const [isOpen, openModal, closeModal] = useModal();
  const [form] = Form.useForm<GitIntegrationFormValues>();
  const [loading, request] = useRequest(updateProjectScm);
  const router = useRouter();

  useEffect(() => {
    store.updateGitIntegrationStatus(isGitIntegrated);
  }, [router.query.pid]);

  const saveGitIntegration = async () => {
    const values = await form.validateFields();

    try {
      await request(router.query.orgId as OrganizationId, router.query.pid as ProjectId, { service: values.git, url: values.repo, token: values.token });
      sendSuccessNotification('Git integration updated successfully');
      store.updateGitIntegrationStatus(true);
      closeModal();
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification('Failed to update Git integration');
      }
    }
  };

  const handleClose = () => {
    closeModal();
    form.resetFields();
  };

  return (
    <>
      <Tooltip title={store.isGitIntegrated ? 'Git integrated' : 'Click for Git integration'}>
        <Tag
          color={store.isGitIntegrated ? 'green' : 'warning'}
          icon={store.isGitIntegrated ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          onClick={() => {
            if (!store.isGitIntegrated) {
              openModal();
            }
          }}
          style={{ cursor: store.isGitIntegrated ? 'default' : 'pointer' }}
        >
          Git
        </Tag>
      </Tooltip>

      <Modal open={isOpen} centered closable onCancel={handleClose} okText={'Save'} onOk={saveGitIntegration} confirmLoading={loading}>
        <GitIntegrationForm form={form} />
      </Modal>
    </>
  );
};

export default GitIntegrationTag;
