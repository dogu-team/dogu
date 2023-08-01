import Head from 'next/head';
import styled from 'styled-components';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import Link from 'next/link';

import { NextPageWithLayout } from 'pages/_app';
import CreateHostModal from 'src/components/hosts/CreateHostModal';
import useModal from 'src/hooks/useModal';
import TableListView from 'src/components/common/TableListView';
import HostListController from 'src/components/hosts/HostListController';
import RefreshButton from 'src/components/buttons/RefreshButton';
import withOrganization, { getOrganizationPageServerSideProps, WithOrganizationProps } from 'src/hoc/withOrganization';
import HostFilter from 'src/components/hosts/HostFilter';
import resources from '../../../../src/resources/index';
import OrganizationDeviceFarmLayout from '../../../../src/components/layouts/OrganizationDeviceFarmLayout';

const HostManagementPage: NextPageWithLayout<WithOrganizationProps> = ({ organization }) => {
  const { t } = useTranslation();
  const [isAddModalOpen, openAddModal, closeAddModal] = useModal();

  return (
    <>
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
                  <Button>
                    {t('device-farm:agentDownloadTitle')}
                    <Image src={resources.icons.externalLink} width={16} height={16} alt="external link" />
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
    </>
  );
};

HostManagementPage.getLayout = (page) => {
  return <OrganizationDeviceFarmLayout>{page}</OrganizationDeviceFarmLayout>;
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default withOrganization(HostManagementPage);

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
