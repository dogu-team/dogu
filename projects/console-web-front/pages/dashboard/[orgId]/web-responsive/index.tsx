import styled from 'styled-components';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import LiveChat from 'src/components/external/livechat';
import WebResponsiveTable from 'src/components/web-responsive/list/WebResponsiveList';
import TableListView from 'src/components/common/TableListView';
import { getWebResponsiveListServerSide } from '../../../../src/api/test-executor';
import { TestExecutorBase } from '@dogu-private/console';
import { getCloudLicenseInServerSide } from '../../../../enterprise/api/license';
import { getOrganizationInServerSide } from '../../../../src/api/organization';
import { getUserInServerSide } from '../../../../src/api/registery';

interface WebResponsiveServerSideProps extends OrganizationServerSideProps {
  testExecutors: TestExecutorBase[];
}

const WebResponsivePage: NextPageWithLayout<WebResponsiveServerSideProps> = ({ user, organization, testExecutors }) => {
  const { t } = useTranslation();

  console.log(testExecutors);

  return (
    <>
      <Head>
        <title>Web Responsive Checker - {organization.name} | Dogu</title>
      </Head>
      <Box>
        <TableListView top={null} table={<WebResponsiveTable testExecutors={testExecutors} />} />
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

WebResponsivePage.getLayout = (page) => {
  return (
    <ConsoleLayout {...page.props} sidebar={<OrganizationSideBar />} titleI18nKey="organization:webResponsivePageTitle">
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps: GetServerSideProps<WebResponsiveServerSideProps> = async (context) => {
  if (process.env.DOGU_RUN_TYPE === 'self-hosted') {
    return {
      notFound: true,
    };
  }

  try {
    const [organization, license, user] = await Promise.all([
      getOrganizationInServerSide(context),
      getCloudLicenseInServerSide(context),
      getUserInServerSide(context),
    ]);
    const testExecutors = await getWebResponsiveListServerSide(context, {
      organizationId: organization.organizationId,
    });

    if (testExecutors) {
      return {
        props: {
          organization,
          license,
          user,
          testExecutors,
        },
      };
    }
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

export default WebResponsivePage;

const Box = styled.div`
  display: flex;
  width: 100%;
`;
