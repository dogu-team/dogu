import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import ProjectLayout from 'src/components/layouts/ProjectLayout';
import withProject, { getProjectPageServerSideProps, WithProjectProps } from 'src/hoc/withProject';
import PipelineReport from 'src/components/projects/PipelineReport';
import { GetServerSideProps } from 'next';
import { redirectWithLocale } from '../../../../../src/ssr/locale';

const ProjectPage: NextPageWithLayout = () => {
  return <div></div>;
};

ProjectPage.getLayout = (page) => {
  return <ProjectLayout isWebview={page.props.isWebview}>{page}</ProjectLayout>;
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
