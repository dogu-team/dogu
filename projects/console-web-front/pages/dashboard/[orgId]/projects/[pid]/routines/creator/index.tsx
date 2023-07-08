import styled from 'styled-components';
import Head from 'next/head';
import { GetServerSideProps } from 'next';

import { NextPageWithLayout } from 'pages/_app';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from 'src/hoc/withProject';
import ProjectLayout from 'src/components/layouts/ProjectLayout';
import RoutineCreator from 'src/components/routine/editor/RoutineCreator';

const ProjectRoutineCreatorPage: NextPageWithLayout<WithProjectProps> = ({ organization, project, isGitIntegrated }) => {
  return (
    <>
      <Head>
        <title>Create routine - {project.name} | Dogu</title>
      </Head>
      <Box>
        <RoutineCreator organizationId={organization.organizationId} projectId={project.projectId} />
      </Box>
    </>
  );
};

ProjectRoutineCreatorPage.getLayout = (page) => {
  return <ProjectLayout isGitIntegrated={page.props.isGitIntegrated}>{page}</ProjectLayout>;
};

export const getServerSideProps: GetServerSideProps = getProjectPageServerSideProps;

export default withProject(ProjectRoutineCreatorPage);

const Box = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;
