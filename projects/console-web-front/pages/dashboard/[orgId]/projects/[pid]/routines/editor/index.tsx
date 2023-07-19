import styled from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import { NextPageWithLayout } from 'pages/_app';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from 'src/hoc/withProject';
import ProjectLayout from 'src/components/layouts/ProjectLayout';
import RoutineUpdator from 'src/components/routine/editor/RoutineUpdator';
import { swrAuthFetcher } from 'src/api';
import useGitIntegrationStore from '../../../../../../../src/stores/git-integration';
import { useEffect } from 'react';
import RoutineGitIntegrationAlert from '../../../../../../../src/components/projects/RoutineGitIntegrationAlert';

const ProjectRoutineEditorPage: NextPageWithLayout<WithProjectProps> = ({ organization, project, isGitIntegrated }) => {
  const store = useGitIntegrationStore();
  const router = useRouter();
  const routineId = router.query.routineId as string | undefined;
  const { data } = useSWR<string>(routineId && `/organizations/${organization.organizationId}/projects/${project.projectId}/routines/file/${routineId}`, swrAuthFetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    store.updateGitIntegrationStatus(isGitIntegrated);
  }, [isGitIntegrated]);

  if (!routineId || !data) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Edit routine - {project.name} | Dogu</title>
      </Head>
      <Box>
        {!store.isGitIntegrated && (
          <div style={{ marginBottom: '1rem' }}>
            <RoutineGitIntegrationAlert />
          </div>
        )}
        <RoutineUpdator organizationId={organization.organizationId} projectId={project.projectId} routineId={routineId} value={data} />
      </Box>
    </>
  );
};

ProjectRoutineEditorPage.getLayout = (page) => {
  return <ProjectLayout>{page}</ProjectLayout>;
};

export const getServerSideProps = getProjectPageServerSideProps;

export default withProject(ProjectRoutineEditorPage);

const Box = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;
