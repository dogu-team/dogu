import { ProjectBase, RecordTestCaseBase } from '@dogu-private/console';
import { Button, ButtonProps, Form, Modal, Input } from 'antd';
import { isAxiosError } from 'axios';

import useModal from '../../../hooks/useModal';
import useRequest from '../../../hooks/useRequest';
import { sendErrorNotification, sendSuccessNotification } from '../../../utils/antd';
import { createVisualCase } from '../../api/visual';

interface Props extends Omit<ButtonProps, 'onClick'> {
  project: ProjectBase;
  onCreate?: (rv: RecordTestCaseBase) => void;
}

const CreateCaseButton = ({ project, onCreate, ...props }: Props) => {
  const [isOpen, openModal, closeModal] = useModal();
  const [form] = Form.useForm();
  const [loading, request] = useRequest(createVisualCase);

  const handleClose = () => {
    closeModal();
    form.resetFields();
  };

  const handleSave = async () => {
    const name = form.getFieldValue('name');

    if (!name) {
      return;
    }

    try {
      const rv = await request(project.organizationId, project.projectId, { name });
      handleClose();
      onCreate?.(rv);
      sendSuccessNotification('Created');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification('Failed to create case');
      }
    }
  };

  return (
    <>
      <Button {...props} onClick={() => openModal()} />

      <Modal
        open={isOpen}
        closable
        onCancel={handleClose}
        title="Create new case"
        destroyOnClose
        centered
        okText="Save"
        okButtonProps={{ htmlType: 'submit', form: 'create-case-form' }}
        onOk={handleSave}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" id="create-case-form">
          <Form.Item name="name" label="Name" required rules={[{ required: true, message: 'Input case name' }]}>
            <Input placeholder="Name" minLength={1} required />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateCaseButton;
