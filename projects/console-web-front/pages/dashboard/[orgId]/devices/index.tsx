import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import TableListView from 'src/components/common/TableListView';
import DeviceListController from 'src/components/device/DeviceListController';
import DeviceFilter from 'src/components/device/DeviceFilter';
import RefreshButton from 'src/components/buttons/RefreshButton';
import withOrganization, { getOrganizationPageServerSideProps, WithOrganizationProps } from 'src/hoc/withOrganization';
import OrganizationDeviceLayout from 'src/components/layouts/OrganizationDeviceLayout';

const TeamDevicePage: NextPageWithLayout<WithOrganizationProps> = ({ organization }) => {
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
  return <OrganizationDeviceLayout>{page}</OrganizationDeviceLayout>;
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default withOrganization(TeamDevicePage);

const TopWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  @media only screen and (max-width: 1023px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
