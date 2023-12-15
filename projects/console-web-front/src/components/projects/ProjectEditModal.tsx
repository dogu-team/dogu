import { ProjectBase } from '@dogu-private/console';
import { PROJECT_DESC_MAX_LENGTH, PROJECT_NAME_MAX_LENGTH } from '@dogu-private/types';
import { Form, Input, Modal } from 'antd';
import { isAxiosError } from 'axios';
import useTranslation from 'next-translate/useTranslation';

import { updateProject } from '../../api/project';
import useRequest from '../../hooks/useRequest';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';

interface Props {
  isOpen: boolean;
  close: () => void;
  project: ProjectBase;
}

const ProjectEditModal: React.FC<Props> = ({ isOpen, close, project }) => {
  const [form] = Form.useForm<{ name: string; desc: string | undefined }>();
  const { t } = useTranslation();
  const [loading, requestEditProject] = useRequest(updateProject);
  const fireEvent = useEventStore((state) => state.fireEvent);

  const handleClose = () => {
    form.resetFields();
    close();
  };

  const handleSubmit = async () => {
    const name = form.getFieldValue('name');
    const desc = form.getFieldValue('desc');

    try {
      await requestEditProject(project.organizationId, project.projectId, { name, description: desc });
      sendSuccessNotification('Successfully updated project.');
      fireEvent('onProjectUpdated');
      close();
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to update project.\n${e.message}`);
      }
    }
  };

  return (
    <Modal
      open={isOpen}
      title="Edit project"
      centered
      closable
      onCancel={handleClose}
      confirmLoading={loading}
      okButtonProps={{ form: 'edit-project-form', htmlType: 'submit' }}
      cancelText={t('common:cancel')}
      okText={t('common:save')}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} id="edit-project-form">
        <Form.Item
          label={t('organization:newProjectModalInputName')}
          name="name"
          required
          rules={[{ required: true, message: 'Please enter name.' }]}
          initialValue={project.name}
        >
          <Input required placeholder="Name" maxLength={PROJECT_NAME_MAX_LENGTH} />
        </Form.Item>
        <Form.Item label={t('organization:newProjectModalInputDesc')} name="desc" initialValue={project.description}>
          <Input placeholder="Description" maxLength={PROJECT_DESC_MAX_LENGTH} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectEditModal;
