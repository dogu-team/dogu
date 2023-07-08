import styled from 'styled-components';
import { GetServerSideProps } from 'next';

import { NextPageWithLayout } from 'pages/_app';
import ProjectLayout from 'src/components/layouts/ProjectLayout';
import { redirectWithLocale } from '../../../../../src/ssr/locale';

const ProjectPage: NextPageWithLayout = () => {
  return <div></div>;
};

ProjectPage.getLayout = (page) => {
  return <ProjectLayout isGitIntegrated={page.props.isGitIntegrated}>{page}</ProjectLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: redirectWithLocale(context, `/dashboard/${context.query.orgId}/projects/${context.query.pid}/routines`, true),
  };
};

export default ProjectPage;

const Box = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
