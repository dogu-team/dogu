import {
  CreateRecordTestCaseDtoBase,
  DeviceBase,
  NewSessionRecordTestCaseDtoBase,
  ProjectApplicationWithIcon,
  ProjectBase,
  RecordTestCaseBase,
} from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import { Button, ButtonProps, Form, Modal, Input, Select } from 'antd';
import { isAxiosError } from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../../api/index';
import ProjectApplicationExtensionTag from '../../../components/project-application/ProjectApplicationExtensionTag';
import useModal from '../../../hooks/useModal';
import useRequest from '../../../hooks/useRequest';
import { flexRowBaseStyle } from '../../../styles/box';
import { sendErrorNotification, sendSuccessNotification } from '../../../utils/antd';
import { getErrorMessageFromAxios } from '../../../utils/error';
import { createNewSession, createRecordTestCase } from '../../api/record';

interface Props extends Omit<ButtonProps, 'onClick'> {
  project: ProjectBase;
  onCreate?: (rv: RecordTestCaseBase) => void | Promise<void>;
  device: DeviceBase;
  isSessionCreating?: boolean;
}

const CreateCaseButton = ({ project, onCreate, device, isSessionCreating, ...props }: Props) => {
  const [isOpen, openModal, closeModal] = useModal();
  const [form] = Form.useForm();
  const [loading, request] = useRequest(createRecordTestCase);
  const extension = device.platform === Platform.PLATFORM_IOS ? 'ipa' : Platform.PLATFORM_ANDROID ? 'apk' : '';
  const { data, isLoading, error } = useSWR<ProjectApplicationWithIcon[]>(
    isOpen &&
      `/organizations/${project.organizationId}/projects/${project.projectId}/applications/packages?extension=${extension}`,
    swrAuthFetcher,
  );
  const FORM_ID = 'create-case-form';
  const formDisabled = loading || isSessionCreating;

  const handleClose = () => {
    closeModal();
    form.resetFields();
  };

  const handleSave = async () => {
    const name = form.getFieldValue('name');
    const app = form.getFieldValue('app');

    if (!name || !app) {
      return;
    }

    try {
      const rv = await request(project.organizationId, project.projectId, {
        name,
        browserName: null,
        packageName: app,
      });
      await onCreate?.(rv);
      handleClose();
      sendSuccessNotification('Created');
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to create case.\n${getErrorMessageFromAxios(e)}`);
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
        okText={loading ? 'Creating test case...' : isSessionCreating ? 'Opening your app...' : 'Save'}
        okButtonProps={{ htmlType: 'submit', form: FORM_ID }}
        onOk={handleSave}
        confirmLoading={formDisabled}
      >
        <Form form={form} layout="vertical" id={FORM_ID}>
          <Form.Item name="name" label="Name" required rules={[{ required: true, message: 'Input case name' }]}>
            <Input placeholder="Name" minLength={1} required disabled={formDisabled} />
          </Form.Item>
          <Form.Item
            name="app"
            label="Application"
            required
            rules={[{ required: true, message: 'Select application' }]}
          >
            <Select placeholder="Select application" dropdownMatchSelectWidth={false} disabled={formDisabled}>
              {data?.map((app) => (
                <Select.Option key={app.projectApplicationId} value={app.package}>
                  <FlexRowSpaceBetween>
                    <FlexRow>
                      {!!app.iconUrl && (
                        <Image
                          src={app.iconUrl}
                          width={20}
                          height={20}
                          alt={app.name}
                          style={{ marginRight: '.5rem' }}
                        />
                      )}
                      <p style={{ marginRight: '.5rem' }}>{app.name}</p>
                      <ProjectApplicationExtensionTag extension={app.fileExtension} />
                    </FlexRow>

                    <VersionText>{`Latest: ${app.version}`}</VersionText>
                  </FlexRowSpaceBetween>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        <div>
          <Description>
            * <Link href={`/dashboard/${project.organizationId}/projects/${project.projectId}/apps`}>Move here</Link>{' '}
            for uploading your application
          </Description>
        </div>
      </Modal>
    </>
  );
};

export default CreateCaseButton;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const FlexRowSpaceBetween = styled(FlexRow)`
  justify-content: space-between;
`;

const VersionText = styled.p`
  margin-left: 0.5rem;
  font-size: 0.75rem;
  color: #999;
`;

const Description = styled.p`
  font-size: 0.8rem;
`;
