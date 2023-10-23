import { LiveSessionBase } from '@dogu-private/console';
import styled from 'styled-components';
import Head from 'next/head';
import { Divider } from 'antd';
import useSWR from 'swr';
import { GetServerSideProps } from 'next';
import { LoadingOutlined } from '@ant-design/icons';
import useTranslation from 'next-translate/useTranslation';

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
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onCloudLiveTestingSessionCreated', 'onCloudLiveTestingSessionClosed'], () =>
    mutate(),
  );

  if (isLoading) {
    return (
      <Centered>
        <LoadingOutlined style={{ fontSize: '2rem' }} />
      </Centered>
    );
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
                <div>
                  <Description>{t('cloud-device:liveSessionListDescription')}</Description>
                </div>
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
          <>
            <DescriptionWrapper>
              <Description>{t('cloud-device:cloudDeviceListDescription')}</Description>
            </DescriptionWrapper>
            <FlexBox>
              <div>
                <CloudDeviceFilter />
              </div>
              <RefreshButton />
            </FlexBox>
          </>
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
  // if (process.env.DOGU_RUN_TYPE === 'self-hosted') {
  //   return {
  //     notFound: true,
  //   };
  // }

  return await getOrganizationPageServerSideProps(context);
};

export default OrganizationLiveTestingPage;

const FlexBox = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const Centered = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const DescriptionWrapper = styled.div`
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  line-height: 1.5;
  color: #666;
`;
