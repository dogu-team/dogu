import styled from 'styled-components';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import LiveChat from 'src/components/external/livechat';
import WebResponsiveHistoryList from 'src/components/web-responsive/list/WebResponsiveHistoryList';
import TableListView from 'src/components/common/TableListView';

const ResponsiveWebTestingPage: NextPageWithLayout<OrganizationServerSideProps> = ({ user, organization }) => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>Web Responsive Checker - {organization.name} | Dogu</title>
      </Head>
      <Box>
        <TableListView top={null} table={<WebResponsiveHistoryList />} />
      </Box>
      <LiveChat
        user={{
          name: user.name,
          email: user.email,
          organizationId: organization.organizationId,
        }}
      />
    </>
  );
};

ResponsiveWebTestingPage.getLayout = (page) => {
  return (
    <ConsoleLayout {...page.props} sidebar={<OrganizationSideBar />} titleI18nKey="organization:webResponsivePageTitle">
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps: GetServerSideProps<OrganizationServerSideProps> = async (context) => {
  return {
    notFound: true,
  };

  if (process.env.DOGU_RUN_TYPE === 'self-hosted') {
    return {
      notFound: true,
    };
  }

  return await getOrganizationPageServerSideProps(context);
};

export default ResponsiveWebTestingPage;

const Box = styled.div`
  display: flex;
  width: 100%;
`;
