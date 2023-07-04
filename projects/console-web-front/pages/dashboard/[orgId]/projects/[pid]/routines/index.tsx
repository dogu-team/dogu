import styled from 'styled-components';
import { useRouter } from 'next/router';
import { RoutineId } from '@dogu-private/types';
import useSWR from 'swr';
import { RoutineBase } from '@dogu-private/console';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { isAxiosError } from 'axios';
import { Button, Form } from 'antd';

import { NextPageWithLayout } from 'pages/_app';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from 'src/hoc/withProject';
import ProjectLayout from 'src/components/layouts/ProjectLayout';
import PipelineListController from 'src/components/pipelines/PipelineListController';
import TableListView from 'src/components/common/TableListView';
import RefreshButton from 'src/components/buttons/RefreshButton';
import PipelineSideBar from 'src/components/pipelines/PipelineSideBar';
import PipelineFilter from 'src/components/pipelines/PipelineFilter';
import RunRoutineButton from 'src/components/pipelines/RunRoutineButton';
import RoutineInfoContainer from 'src/components/routine/RoutineInfoContainer';
import { swrAuthFetcher } from 'src/api/index';
import EditRoutineButton from 'src/components/routine/EditRoutineButton';
import { getProjectGit, updateProjectGit } from '../../../../../../src/api/project';
import GitIntegrationForm, { GitIntegrationFormValues } from '../../../../../../src/components/projects/GitIntegrationForm';
import { sendErrorNotification, sendSuccessNotification } from '../../../../../../src/utils/antd';
import { getErrorMessage } from '../../../../../../src/utils/error';
import useRequest from '../../../../../../src/hooks/useRequest';

const ProjectRoutinePage: NextPageWithLayout<WithProjectProps & { isGitConfigured: boolean }> = ({ organization, project, isGitConfigured }) => {
  const router = useRouter();
  const routineId = router.query.routine as RoutineId | undefined;
  const { data } = useSWR<RoutineBase>(routineId && `/organizations/${organization.organizationId}/projects/${project.projectId}/routines/${routineId}`, swrAuthFetcher);
  const [form] = Form.useForm<GitIntegrationFormValues>();
  const [loading, request] = useRequest(updateProjectGit);

  const saveGitIntegration = async () => {
    try {
      const values = await form.validateFields();
      await request(organization.organizationId, project.projectId, { service: values.git, url: values.repo, token: values.token });
      sendSuccessNotification('Git integration updated successfully');
      router.push(`/dashboard/${organization.organizationId}/projects/${project.projectId}/routines`);
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to update: ${getErrorMessage(e)}`);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Routine - {project.name} | Dogu</title>
      </Head>
      <Box>
        {isGitConfigured ? (
          <PipelineContainer>
            <TableListView
              top={
                <PipelineTopBox>
                  <RoutineInfoContainer orgId={organization.organizationId} projectId={project.projectId} routine={data} />

                  <PipelineTopButtonWrapper>
                    <RowFlexBox>
                      <RunRoutineButton orgId={organization.organizationId} projectId={project.projectId} routine={data} />
                      <EditRoutineButton orgId={organization.organizationId} projectId={project.projectId} routine={data} />
                      <PipelineFilter />
                    </RowFlexBox>
                    <RefreshButton />
                  </PipelineTopButtonWrapper>
                </PipelineTopBox>
              }
              table={<PipelineListController organizationId={organization.organizationId} projectId={project.projectId} />}
            />
          </PipelineContainer>
        ) : (
          <GitBox>
            <div>
              <b>For use routine feature, you need to configure git integration.</b>
              <p>Docs link</p>
            </div>
            <FormWrapper>
              <GitIntegrationForm form={form} />
              <div>
                <Button type="primary" onClick={saveGitIntegration} loading={loading}>
                  Save
                </Button>
              </div>
            </FormWrapper>
          </GitBox>
        )}
      </Box>
    </>
  );
};

ProjectRoutinePage.getLayout = (page) => {
  return <ProjectLayout sidebar={page.props.isGitConfigured ? <PipelineSideBar /> : undefined}>{page}</ProjectLayout>;
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

  if ('redirect' in result || 'notFound' in result) {
    return result;
  }

  try {
    await getProjectGit(context);
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

export default withProject(ProjectRoutinePage);

const Box = styled.div``;

const PipelineTopBox = styled.div``;

const PipelineTopButtonWrapper = styled.div`
  display: flex;
  margin-top: 1rem;
  justify-content: space-between;
  align-items: center;
`;

const PipelineContainer = styled.div`
  flex: 1;
`;

const RowFlexBox = styled.div`
  display: flex;
  align-items: center;
`;

const GitBox = styled.div`
  line-height: 1.4;
  max-width: 600px;
`;

const FormWrapper = styled.div`
  margin-top: 1rem;
`;
