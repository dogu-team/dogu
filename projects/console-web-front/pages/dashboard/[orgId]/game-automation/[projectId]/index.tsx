import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import { getProjectPageServerSideProps, ProjectServerSideProps } from '../../../../../src/ssr/project';

const GameAutomationPage: NextPageWithLayout<ProjectServerSideProps> = ({ user, organization }) => {
  return (
    <>
      <Head>
        <title>Game Automation - {organization.name} | Dogu</title>
      </Head>
    </>
  );
};

GameAutomationPage.getLayout = (page) => {
  return (
    <ConsoleLayout {...page.props} sidebar={<OrganizationSideBar />} titleI18nKey="organization:projectPageTitle">
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps = getProjectPageServerSideProps;

export default GameAutomationPage;
