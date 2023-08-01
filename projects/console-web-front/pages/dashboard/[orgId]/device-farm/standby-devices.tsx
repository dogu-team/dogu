import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import RefreshButton from 'src/components/buttons/RefreshButton';
import TableListView from 'src/components/common/TableListView';
import AddableDeviceFilter from 'src/components/device/AddableDeviceFilter';
import AddableDeviceListController from 'src/components/device/AddableDeviceListController';
import withOrganization, { getOrganizationPageServerSideProps, WithOrganizationProps } from 'src/hoc/withOrganization';
import OrganizationDeviceFarmLayout from '../../../../src/components/layouts/OrganizationDeviceFarmLayout';

const AddDevicesPage: NextPageWithLayout<WithOrganizationProps> = ({ organization }) => {
  return (
    <>
      <Head>
        <title>Standby devices - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <TopWrapper>
            <AddableDeviceFilter />
            <RefreshButton />
          </TopWrapper>
        }
        table={<AddableDeviceListController />}
      />
    </>
  );
};

AddDevicesPage.getLayout = (page) => {
  return <OrganizationDeviceFarmLayout>{page}</OrganizationDeviceFarmLayout>;
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default withOrganization(AddDevicesPage);

const TopWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;
