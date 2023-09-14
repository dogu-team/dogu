import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Alert, Button, Form, Modal, Space } from 'antd';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { updateProjectScm } from '../../api/project';
import useModal from '../../hooks/useModal';
import useRequest from '../../hooks/useRequest';
import useGitIntegrationStore from '../../stores/git-integration';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';
import GitIntegrationForm, { GitIntegrationFormValues } from './GitIntegrationForm';

const RoutineGitIntegrationAlert = () => {
  const store = useGitIntegrationStore();
  const [isOpen, openModal, closeModal] = useModal();
  const [form] = Form.useForm<GitIntegrationFormValues>();
  const router = useRouter();
  const [loading, request] = useRequest(updateProjectScm);
  const { t } = useTranslation('project');

  const saveGitIntegration = async () => {
    const values = await form.validateFields();

    try {
      await request(router.query.orgId as OrganizationId, router.query.pid as ProjectId, {
        service: values.git,
        url: values.repo.replace('.git', ''),
        token: values.token,
      });
      sendSuccessNotification(t('projectUpdateSuccessMsg'));
      store.updateGitIntegrationStatus(true);
      closeModal();
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(t('projectUpdateFailedMsg', { reason: getErrorMessageFromAxios(e) }));
      }
    }
  };

  const handleClose = () => {
    closeModal();
    form.resetFields();
  };

  return (
    <>
      <Alert
        type="warning"
        showIcon
        message="Your project is not currently integrated with a Git repository. Routine execution is possible after Git integration."
        action={
          <Space direction="vertical">
            <Button type="primary" size="small" style={{ width: '100%' }} onClick={() => openModal()}>
              Integrate
            </Button>
            <Link
              href="https://docs.dogutech.io/management/project/git-integration/"
              target="_blank"
              style={{ textDecoration: 'none' }}
            >
              <Button size="small">Documentation</Button>
            </Link>
          </Space>
        }
      />

      <Modal
        open={isOpen}
        centered
        closable
        onCancel={handleClose}
        okText={'Save'}
        onOk={saveGitIntegration}
        confirmLoading={loading}
      >
        <GitIntegrationForm form={form} />
      </Modal>
    </>
  );
};

export default RoutineGitIntegrationAlert;
