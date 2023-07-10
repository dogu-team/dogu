import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import RefreshButton from 'src/components/buttons/RefreshButton';
import TableListView from 'src/components/common/TableListView';
import AddableDeviceFilter from 'src/components/device/AddableDeviceFilter';
import OrganizationRunnerLayout from 'src/components/layouts/OrganizationRunnerLayout';
import withOrganization, { getOrganizationPageServerSideProps, WithOrganizationProps } from 'src/hoc/withOrganization';
import CloudDeviceListController from '../../../../src/components/device/CloudDeviceListController';

const AddCloudDevicePage: NextPageWithLayout<WithOrganizationProps> = ({ organization }) => {
  return (
    <>
      <Head>
        <title>Cloud devices - {organization.name} | Dogu</title>
      </Head>
      <TableListView
        top={
          <TopWrapper>
            <AddableDeviceFilter />
            <RefreshButton />
          </TopWrapper>
        }
        table={<CloudDeviceListController />}
      />
    </>
  );
};

AddCloudDevicePage.getLayout = (page) => {
  return <OrganizationRunnerLayout>{page}</OrganizationRunnerLayout>;
};

export const getServerSideProps = getOrganizationPageServerSideProps;

export default withOrganization(AddCloudDevicePage);

const TopWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;
