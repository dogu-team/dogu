import styled from 'styled-components';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { Alert, Button, Form, Modal } from 'antd';
import Link from 'next/link';

import { NextPageWithLayout } from 'pages/_app';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from 'src/hoc/withProject';
import ProjectLayout from 'src/components/layouts/ProjectLayout';
import RoutineCreator from 'src/components/routine/editor/RoutineCreator';
import { getProjectScm, updateProjectScm } from '../../../../../../../src/api/project';
import useModal from '../../../../../../../src/hooks/useModal';
import GitIntegrationForm, { GitIntegrationFormValues } from '../../../../../../../src/components/projects/GitIntegrationForm';
import useRequest from '../../../../../../../src/hooks/useRequest';
import { sendErrorNotification, sendSuccessNotification } from '../../../../../../../src/utils/antd';
import { getErrorMessage } from '../../../../../../../src/utils/error';

const ProjectRoutineCreatorPage: NextPageWithLayout<WithProjectProps & { isGitConfigured: boolean }> = ({ organization, project, isGitConfigured }) => {
  const [isConfigured, setIsConfigured] = useState(isGitConfigured);
  const [isOpen, openModal, closeModal] = useModal();
  const [form] = Form.useForm<GitIntegrationFormValues>();
  const [loading, request] = useRequest(updateProjectScm);

  const handleCloseModal = () => {
    form.resetFields();
    closeModal();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await request(organization.organizationId, project.projectId, { service: values.git, url: values.repo, token: values.token });
      sendSuccessNotification('Git integration updated successfully');
      setIsConfigured(true);
      handleCloseModal();
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to update: ${getErrorMessage(e)}`);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Create routine - {project.name} | Dogu</title>
      </Head>
      <Box>
        {!isConfigured && (
          <Alert
            showIcon
            type="warning"
            style={{ marginBottom: '.5rem' }}
            message={
              <p>
                &nbsp;Git doesn&apos;t integrated yet. Cannot checkout test scripts while routine running. For more information, please visit&nbsp;
                <Link href="https://docs.dogutech.io" target="_blank">
                  document
                </Link>
              </p>
            }
            action={<Button onClick={() => openModal()}>Configure Git</Button>}
          />
        )}
        <RoutineCreator organizationId={organization.organizationId} projectId={project.projectId} />
      </Box>

      <Modal open={isOpen} closable onCancel={handleCloseModal} centered title="Git integration" okText="Save" onOk={handleSave} confirmLoading={loading}>
        <GitIntegrationForm form={form} />
      </Modal>
    </>
  );
};

ProjectRoutineCreatorPage.getLayout = (page) => {
  return <ProjectLayout>{page}</ProjectLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const result = await getProjectPageServerSideProps(context);

  if ('redirect' in result || 'notFound' in result) {
    return result;
  }

  try {
    await getProjectScm(context);
    return {
      props: {
        ...result.props,
        isGitConfigured: true,
      },
    };
  } catch (e) {
    if (isAxiosError(e)) {
      if (e.response?.status === 404) {
        return {
          props: {
            ...result.props,
            isGitConfigured: false,
          },
        };
      }
    }

    return {
      props: {
        ...result.props,
        isGitConfigured: false,
      },
    };
  }
};

export default withProject(ProjectRoutineCreatorPage);

const Box = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;
