import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import { OrganizationServerSideProps } from 'src/ssr/organization';
import { getProjectPageServerSideProps } from '../../../../../src/ssr/project';

const WebAutomationPage: NextPageWithLayout<OrganizationServerSideProps> = ({ user, organization }) => {
  return (
    <>
      <Head>
        <title>Web Automation - {organization.name} | Dogu</title>
      </Head>
    </>
  );
};

WebAutomationPage.getLayout = (page) => {
  return (
    <ConsoleLayout {...page.props} sidebar={<OrganizationSideBar />} titleI18nKey="organization:projectPageTitle">
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps = getProjectPageServerSideProps;

export default WebAutomationPage;
