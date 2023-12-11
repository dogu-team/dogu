import { Form, Input } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import {
  OrganizationId,
  PROJECT_DESC_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
  PROJECT_NAME_MIN_LENGTH,
  PROJECT_TYPE,
} from '@dogu-private/types';
import { ProjectBase } from '@dogu-private/console';

import { createProject } from 'src/api/project';
import FormControlModal from '../modals/FormControlModal';
import { useState } from 'react';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import useEventStore from '../../stores/events';
import { AxiosError } from 'axios';
import { getErrorMessageFromAxios } from '../../utils/error';
import ProjectTypeRadio from './ProjectTypeRadio';

interface Props {
  isOpen: boolean;
  close: () => void;
  onCreate: (result: ProjectBase) => void;
  projectType?: PROJECT_TYPE;
}

const CreateProjectModal = ({ isOpen, close, onCreate, projectType }: Props) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const fireEvent = useEventStore((state) => state.fireEvent);
  const organizationId = router.query.orgId as OrganizationId;

  const handleClose = () => {
    form.resetFields();
    close();
  };

  const handleCreate = async () => {
    const name = form.getFieldValue('name');
    const desc = form.getFieldValue('desc');
    const type = form.getFieldValue('type');

    const createProjectBody = { name, description: desc, type: projectType ?? type };

    setLoading(true);
    if (name) {
      try {
        const result = await createProject(organizationId, createProjectBody);
        fireEvent('onProjectCreated');
        sendSuccessNotification(t('organization:newProjectSuccessTitle', { name }));
        form.resetFields();
        handleClose();
        onCreate(result);
      } catch (e) {
        if (e instanceof AxiosError) {
          sendErrorNotification(t('organization:newProjectFailTitle', { reason: getErrorMessageFromAxios(e) }));
        }
      }
    }
    setLoading(false);
  };

  return (
    <FormControlModal
      title={t('organization:addNewProject')}
      cancelText={t('common:cancel')}
      okText={t('common:add')}
      form={
        <Form form={form} id="new-project" layout="vertical" onFinish={handleCreate}>
          {projectType === undefined && (
            <Form.Item
              label={t('organization:newProjectModalProjectType')}
              name="type"
              rules={[{ required: true, message: 'Select your project template' }]}
              initialValue={PROJECT_TYPE.WEB}
            >
              <ProjectTypeRadio />
            </Form.Item>
          )}
          <Form.Item
            label={t('organization:newProjectModalInputName')}
            name="name"
            rules={[{ required: true, message: t('common:nameInputEmptyError') }]}
          >
            <Input
              type="text"
              placeholder={t('common:name')}
              required
              minLength={PROJECT_NAME_MIN_LENGTH}
              maxLength={PROJECT_NAME_MAX_LENGTH}
              autoFocus
            />
          </Form.Item>
          <Form.Item label={t('organization:newProjectModalInputDesc')} name="desc">
            <Input
              type="text"
              placeholder={t('organization:newProjectModalInputDescPlaceholder')}
              maxLength={PROJECT_DESC_MAX_LENGTH}
            />
          </Form.Item>
        </Form>
      }
      formId="new-project"
      close={handleClose}
      open={isOpen}
      centered
      confirmLoading={loading}
    />
  );
};

export default CreateProjectModal;
