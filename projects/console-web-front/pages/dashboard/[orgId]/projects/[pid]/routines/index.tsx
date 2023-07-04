import styled from 'styled-components';
import { useRouter } from 'next/router';
import { RoutineId } from '@dogu-private/types';
import useSWR from 'swr';
import { RoutineBase } from '@dogu-private/console';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { isAxiosError } from 'axios';

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
import { getProjectGit } from '../../../../../../src/api/project';

const ProjectPipelineListPage: NextPageWithLayout<WithProjectProps> = ({ organization, project }) => {
  const router = useRouter();
  const routineId = router.query.routine as RoutineId | undefined;
  const { data } = useSWR<RoutineBase>(routineId && `/organizations/${organization.organizationId}/projects/${project.projectId}/routines/${routineId}`, swrAuthFetcher);

  return (
    <>
      <Head>
        <title>Routine - {project.name} | Dogu</title>
      </Head>
      <Box>
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
      </Box>
    </>
  );
};

ProjectPipelineListPage.getLayout = (page) => {
  return <ProjectLayout sidebar={<PipelineSideBar />}>{page}</ProjectLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const result = await getProjectPageServerSideProps(context);

  if ('redirect' in result || 'notFound' in result) {
    return result;
  }

  try {
    await getProjectGit(context);
  } catch (e) {
    if (isAxiosError(e)) {
      if (e.response?.status === 404) {
        return {
          redirect: {
            destination: `/dashboard/${context.query.orgId}/projects/${context.query.pid}/git`,
            permanent: false,
          },
        };
      }
    }
  }

  return result;
};

export default withProject(ProjectPipelineListPage);

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
