import styled from 'styled-components';
import { GetServerSideProps } from 'next';

import { NextPageWithLayout } from 'pages/_app';
import { redirectWithLocale } from '../../../../../src/ssr/locale';
import ProjectLayoutWithSidebar from '../../../../../src/components/layouts/ProjectLayoutWithSidebar';

const ProjectPage: NextPageWithLayout = () => {
  return <div></div>;
};

ProjectPage.getLayout = (page) => {
  return page;
  // return <ProjectLayoutWithSidebar>{page}</ProjectLayoutWithSidebar>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: redirectWithLocale(context, `/dashboard/${context.query.orgId}/projects/${context.query.pid}/remotes`, true),
  };
};

export default ProjectPage;

const Box = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
