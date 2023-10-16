import { LiveSessionBase } from '@dogu-private/console';
import styled from 'styled-components';
import Head from 'next/head';
import { Divider } from 'antd';
import useSWR from 'swr';
import { GetServerSideProps } from 'next';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import TableListView from '../../../../src/components/common/TableListView';
import RefreshButton from '../../../../src/components/buttons/RefreshButton';
import { flexRowSpaceBetweenStyle } from '../../../../src/styles/box';
import LiveChat from '../../../../src/components/external/livechat';
import LiveTestingCloudDeviceList from '../../../../src/components/cloud/LiveTestingCloudDeviceList';
import CloudDeviceFilter from '../../../../src/components/cloud/CloudDeviceFilter';
import LiveTestingSessionList from '../../../../src/components/cloud/LiveTestingSessionList';
import { swrAuthFetcher } from '../../../../src/api';
import useRefresh from '../../../../src/hooks/useRefresh';

const OrganizationLiveTestingPage: NextPageWithLayout<OrganizationServerSideProps> = ({ user, organization }) => {
  const { data, isLoading, mutate } = useSWR<LiveSessionBase[]>(
    `/organizations/${organization.organizationId}/live-sessions`,
    swrAuthFetcher,
    { keepPreviousData: true },
  );

  useRefresh(['onRefreshClicked', 'onCloudLiveTestingSessionCreated', 'onCloudLiveTestingSessionClosed'], () =>
    mutate(),
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Live Testing - {organization.name} | Dogu</title>
      </Head>
      {!!data && data.length > 0 && (
        <>
          <TableListView
            top={
              <FlexBox>
                <div></div>
                <RefreshButton />
              </FlexBox>
            }
            table={<LiveTestingSessionList data={data} />}
          />
          <Divider />
        </>
      )}
      <TableListView
        top={
          <FlexBox>
            <div>
              <CloudDeviceFilter />
            </div>
            <RefreshButton />
          </FlexBox>
        }
        table={<LiveTestingCloudDeviceList />}
      />
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

OrganizationLiveTestingPage.getLayout = (page) => {
  return (
    <ConsoleLayout {...page.props} sidebar={<OrganizationSideBar />} titleI18nKey="organization:liveTestingPageTitle">
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps: GetServerSideProps<OrganizationServerSideProps> = async (context) => {
  if (process.env.DOGU_RUN_TYPE === 'self-hosted') {
    return {
      notFound: true,
    };
  }

  return await getOrganizationPageServerSideProps(context);
};

export default OrganizationLiveTestingPage;

const FlexBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
