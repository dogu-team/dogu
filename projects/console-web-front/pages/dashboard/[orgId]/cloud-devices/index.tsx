import styled from 'styled-components';
import Head from 'next/head';

import { NextPageWithLayout } from 'pages/_app';
import TableListView from 'src/components/common/TableListView';
import DeviceListController from 'src/components/device/DeviceListController';
import DeviceFilter from 'src/components/device/DeviceFilter';
import RefreshButton from 'src/components/buttons/RefreshButton';
import withOrganization, { getOrganizationPageServerSideProps, WithOrganizationProps } from 'src/hoc/withOrganization';
import OrganizationDeviceLayout from 'src/components/layouts/OrganizationDeviceLayout';
import OrganizationSideBar from '../../../../src/components/layouts/OrganizationSideBar';
import ConsoleLayout from '../../../../src/components/layouts/ConsoleLayout';

const TeamDevicePage: NextPageWithLayout<WithOrganizationProps> = ({ organization }) => {
  return (
    <>
      <Head>
        <title>{organization.name} - Cloud Devices | Dogu</title>
      </Head>
    </>
  );
};

TeamDevicePage.getLayout = (page) => {
  return (
    <ConsoleLayout isWebview={page.props.isWebview} titleI18nKey="organization:cloudDevicePageTitle" sidebar={<OrganizationSideBar />}>
      {page}
    </ConsoleLayout>
  );
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
