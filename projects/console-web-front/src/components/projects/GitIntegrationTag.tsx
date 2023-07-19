import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Form, Modal, Tag, Tooltip } from 'antd';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { updateProjectScm } from '../../api/project';
import useModal from '../../hooks/useModal';
import useRequest from '../../hooks/useRequest';
import useGitIntegrationStore from '../../stores/git-integration';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessage } from '../../utils/error';
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
  const { t } = useTranslation('project');

  useEffect(() => {
    store.updateGitIntegrationStatus(isGitIntegrated);
  }, [router.query.pid]);

  const saveGitIntegration = async () => {
    const values = await form.validateFields();

    try {
      await request(router.query.orgId as OrganizationId, router.query.pid as ProjectId, { service: values.git, url: values.repo, token: values.token });
      sendSuccessNotification(t('projectUpdateSuccessMsg'));
      store.updateGitIntegrationStatus(true);
      closeModal();
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(t('projectUpdateFailedMsg', { reason: getErrorMessage(e) }));
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
