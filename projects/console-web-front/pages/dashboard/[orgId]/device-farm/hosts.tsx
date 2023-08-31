import Head from 'next/head';
import styled from 'styled-components';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { FcDownload } from 'react-icons/fc';
import useSWR from 'swr';
import { DownloadablePackageResult } from '@dogu-private/types';
import { createContext } from 'react';

import { NextPageWithLayout } from 'pages/_app';
import CreateHostModal from 'src/components/hosts/CreateHostModal';
import useModal from 'src/hooks/useModal';
import TableListView from 'src/components/common/TableListView';
import HostListController from 'src/components/hosts/HostListController';
import RefreshButton from 'src/components/buttons/RefreshButton';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import HostFilter from 'src/components/hosts/HostFilter';
import OrganizationDeviceFarmLayout from '../../../../src/components/layouts/OrganizationDeviceFarmLayout';
import { swrAuthFetcher } from '../../../../src/api';

export const DoguAgentLatestContext = createContext<{ latestInfo: DownloadablePackageResult[] }>({
  latestInfo: [],
});

const HostManagementPage: NextPageWithLayout<OrganizationServerSideProps> = ({ organization }) => {
  const { t } = useTranslation();
  const [isAddModalOpen, openAddModal, closeAddModal] = useModal();
  const { data } = useSWR<DownloadablePackageResult[]>(`/downloads/dogu-agent/latest`, swrAuthFetcher, { revalidateOnFocus: false });

  return (
    <DoguAgentLatestContext.Provider value={{ latestInfo: data ?? [] }}>
      <Head>
        <title>Hosts - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <ButtonBox>
            <LeftTopBox>
              <Button type="primary" onClick={() => openAddModal()} access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'add-new-host-btn' : undefined}>
                {t('device-farm:addNewHost')}
              </Button>
              {process.env.NEXT_PUBLIC_ENV !== 'self-hosted' && (
                <Link href={`${process.env.NEXT_PUBLIC_LANDING_URL}/downloads/dogu-agent`} target="_blank">
                  <Button style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '' }}>
                    <FcDownload style={{ marginRight: '4px' }} width={24} height={24} />
                    {t('device-farm:agentDownloadTitle')}
                  </Button>
                </Link>
              )}
              <HostFilter />
            </LeftTopBox>
            <RefreshButton {...(process.env.NEXT_PUBLIC_ENV !== 'production' ? { 'access-id': 'host-refresh' } : {})} />
          </ButtonBox>
        }
        table={<HostListController />}
      />

      <CreateHostModal close={closeAddModal} isOpen={isAddModalOpen} />
    </DoguAgentLatestContext.Provider>
  );
};

HostManagementPage.getLayout = (page) => {
  return <OrganizationDeviceFarmLayout organization={page.props.organization}>{page}</OrganizationDeviceFarmLayout>;
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default HostManagementPage;

const ButtonBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const LeftTopBox = styled.div`
  display: flex;

  & > * {
    margin-right: 0.5rem;
  }

  @media only screen and (max-width: 767px) {
    flex-direction: column;
    margin-right: 0.5rem;

    & > * {
      margin-right: 0;
    }

    & > *:first-child {
      margin-bottom: 0.5rem;
    }
  }
`;
