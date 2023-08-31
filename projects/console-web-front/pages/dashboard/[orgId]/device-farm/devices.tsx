import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import TableListView from 'src/components/common/TableListView';
import DeviceListController from 'src/components/device/DeviceListController';
import DeviceFilter from 'src/components/device/DeviceFilter';
import RefreshButton from 'src/components/buttons/RefreshButton';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/hoc/withOrganization';
import OrganizationDeviceFarmLayout from '../../../../src/components/layouts/OrganizationDeviceFarmLayout';

const TeamDevicePage: NextPageWithLayout<OrganizationServerSideProps> = ({ organization }) => {
  return (
    <>
      <Head>
        <title>In-use devices - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <TopWrapper>
            <DeviceFilter />
            <RefreshButton />
          </TopWrapper>
        }
        table={<DeviceListController />}
      />
    </>
  );
};

TeamDevicePage.getLayout = (page) => {
  return <OrganizationDeviceFarmLayout organization={page.props.organization}>{page}</OrganizationDeviceFarmLayout>;
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default TeamDevicePage;

const TopWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  @media only screen and (max-width: 1023px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
