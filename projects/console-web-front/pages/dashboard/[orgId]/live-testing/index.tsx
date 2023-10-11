import styled from 'styled-components';
import Head from 'next/head';
import { Divider } from 'antd';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import TableListView from '../../../../src/components/common/TableListView';
import RefreshButton from '../../../../src/components/buttons/RefreshButton';
import { flexRowSpaceBetweenStyle } from '../../../../src/styles/box';
import LiveChat from '../../../../src/components/external/livechat';
import LiveTestingCloudDeviceList from '../../../../src/components/cloud/LiveTestingCloudDeviceList';

const OrganizationLiveTestingPage: NextPageWithLayout<OrganizationServerSideProps> = ({ user, organization }) => {
  const hasUsingDevices = true;

  return (
    <>
      <Head>
        <title>Live Testing - {organization.name} | Dogu</title>
      </Head>
      {hasUsingDevices && (
        <>
          <TableListView
            top={
              <FlexBox>
                <div></div>
                <RefreshButton />
              </FlexBox>
            }
            table={<div>Using...</div>}
          />
          <Divider />
        </>
      )}
      <TableListView
        top={
          <FlexBox>
            <div></div>
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

export const getServerSideProps = getOrganizationPageServerSideProps;

export default OrganizationLiveTestingPage;

const FlexBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
