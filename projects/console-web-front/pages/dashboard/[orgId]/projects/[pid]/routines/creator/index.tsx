import styled from 'styled-components';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useEffect } from 'react';

import { NextPageWithLayout } from 'pages/_app';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from 'src/hoc/withProject';
import RoutineCreator from 'src/components/routine/editor/RoutineCreator';
import RoutineGitIntegrationAlert from '../../../../../../../src/components/projects/RoutineGitIntegrationAlert';
import useGitIntegrationStore from '../../../../../../../src/stores/git-integration';
import ProjectLayoutWithSidebar from '../../../../../../../src/components/layouts/ProjectLayoutWithSidebar';

const ProjectRoutineCreatorPage: NextPageWithLayout<WithProjectProps> = ({ organization, project, isGitIntegrated }) => {
  const store = useGitIntegrationStore();

  useEffect(() => {
    store.updateGitIntegrationStatus(isGitIntegrated);
  }, [isGitIntegrated]);

  return (
    <>
      <Head>
        <title>Create routine - {project.name} | Dogu</title>
      </Head>
      <Box>
        {!store.isGitIntegrated && (
          <div style={{ marginBottom: '1rem' }}>
            <RoutineGitIntegrationAlert />
          </div>
        )}
        <RoutineCreator organizationId={organization.organizationId} projectId={project.projectId} />
      </Box>
    </>
  );
};

ProjectRoutineCreatorPage.getLayout = (page) => {
  return <ProjectLayoutWithSidebar title="Routine">{page}</ProjectLayoutWithSidebar>;
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default withProject(ProjectRoutineCreatorPage);

const Box = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;
