import styled from 'styled-components';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';

import { NextPageWithLayout } from 'pages/_app';
import { getProjectPageServerSideProps, ProjectServerSideProps } from 'src/ssr/project';
import RoutineCreator from 'src/components/routine/editor/RoutineCreator';
import RoutineGitIntegrationAlert from '../../../../../../../src/components/projects/RoutineGitIntegrationAlert';
import useGitIntegrationStore from '../../../../../../../src/stores/git-integration';
import ProjectLayoutWithSidebar from '../../../../../../../src/components/layouts/ProjectLayoutWithSidebar';

const ProjectRoutineCreatorPage: NextPageWithLayout<ProjectServerSideProps> = ({
  organization,
  project,
  isGitIntegrated,
}) => {
  const [isGitIntegratedState, updateGitIntegrationStatus] = useGitIntegrationStore(
    (state) => [state.isGitIntegrated, state.updateGitIntegrationStatus],
    shallow,
  );

  useEffect(() => {
    updateGitIntegrationStatus(isGitIntegrated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGitIntegrated]);

  return (
    <>
      <Head>
        <title>Create routine - {project.name} | Dogu</title>
      </Head>
      <Box>
        {!isGitIntegratedState && (
          <div style={{ marginBottom: '1rem' }}>
            <RoutineGitIntegrationAlert />
          </div>
        )}
        <RoutineCreator project={project} />
      </Box>
    </>
  );
};

ProjectRoutineCreatorPage.getLayout = (page) => {
  return (
    <ProjectLayoutWithSidebar {...page.props} titleI18nKey="project:tabMenuRoutineTitle">
      {page}
    </ProjectLayoutWithSidebar>
  );
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default ProjectRoutineCreatorPage;

const Box = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;
