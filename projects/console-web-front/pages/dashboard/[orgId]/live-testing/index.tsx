import { CloudLicenseBase, LiveSessionBase } from '@dogu-private/console';
import styled from 'styled-components';
import Head from 'next/head';
import { Divider } from 'antd';
import useSWR from 'swr';
import { GetServerSideProps } from 'next';
import { LoadingOutlined } from '@ant-design/icons';
import useTranslation from 'next-translate/useTranslation';
import { useEffect } from 'react';
import { LiveSessionId } from '@dogu-private/types';
import Trans from 'next-translate/Trans';

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
import H4 from '../../../../src/components/common/headings/H4';
import LiveTestingFeedbackModal, {
  LIVE_TESTING_FEEDBACK_LOCAL_STORAGE_KEY,
} from '../../../../src/components/cloud/LiveTestingFeedbackModal';
import useModal from '../../../../src/hooks/useModal';
import LiveTestingSessionCounter from '../../../../src/components/cloud/LiveTestingSessionCounter';

const OrganizationLiveTestingPage: NextPageWithLayout<OrganizationServerSideProps> = ({
  user,
  organization,
  license,
}) => {
  const { data, isLoading, mutate } = useSWR<LiveSessionBase[]>(
    `/organizations/${organization.organizationId}/live-sessions`,
    swrAuthFetcher,
    { refreshInterval: 10000 },
  );
  const [isOpen, openModal, closeModal, payload] = useModal<LiveSessionId>();
  const { t } = useTranslation();

  useRefresh(['onRefreshClicked', 'onCloudLiveTestingSessionCreated', 'onCloudLiveTestingSessionClosed'], () =>
    mutate(),
  );

  useEffect(() => {
    const bc = new BroadcastChannel('dogu-live-testing');

    bc.onmessage = (event) => {
      if (localStorage.getItem(LIVE_TESTING_FEEDBACK_LOCAL_STORAGE_KEY) === 'true') {
        return;
      }

      if (event.data.type === 'close') {
        const { sessionId } = event.data;

        if (sessionId) {
          openModal(sessionId);
        }
      }
    };

    return () => {
      bc.close();
    };
  }, []);

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
              <FlexSpaceBetweenBox>
                <div>
                  <Description>{t('cloud-device:liveSessionListDescription')}</Description>
                </div>

                <RefreshButton />
              </FlexSpaceBetweenBox>
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
            <FlexSpaceBetweenBox>
              <div>
                <CloudDeviceFilter />
              </div>
              <RefreshButton />
            </FlexSpaceBetweenBox>
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
      <LiveTestingFeedbackModal
        userId={user.userId}
        sessionId={payload ?? 'NO ID'}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </>
  );
};

OrganizationLiveTestingPage.getLayout = (page) => {
  return (
    <ConsoleLayout
      {...page.props}
      sidebar={<OrganizationSideBar />}
      title={
        <div style={{ marginBottom: '.5rem' }}>
          <H4>
            <Trans i18nKey="organization:liveTestingPageTitle" />
          </H4>
          <div style={{ marginTop: '.25rem' }}>
            <LiveTestingSessionCounter
              license={page.props.license as CloudLicenseBase}
              organizationId={page.props.organization.organizationId}
            />
          </div>
        </div>
      }
    >
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

const FlexSpaceBetweenBox = styled.div`
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
