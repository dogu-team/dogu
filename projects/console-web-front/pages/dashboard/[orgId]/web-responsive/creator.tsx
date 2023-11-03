import styled from 'styled-components';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { Vendor } from '@dogu-private/device-data';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import VendorMarketShare from '../../../../src/components/web-responsive/generator/VendorMarketShare';
import H4 from '../../../../src/components/common/headings/H4';
import DeviceVendorSelector from '../../../../src/components/web-responsive/generator/DeviceVendorSelector';
import { ResponsiveWebTestingContext } from '../../../../src/components/web-responsive/hook/useResponsiveWebTestingContext';
import WebAddressInput from '../../../../src/components/web-responsive/generator/WebAddressInput';
import RunButton from '../../../../src/components/web-responsive/generator/RunButton';
import { createWebResponsive } from '../../../../src/api/test-executor';

const WebResponsiveCreatorPage: NextPageWithLayout<OrganizationServerSideProps> = ({ user, organization }) => {
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>([]);
  const { t } = useTranslation();

  return (
    <ResponsiveWebTestingContext.Provider value={{ selectedVendors, setSelectedVendors }}>
      <Head>
        <title>Web Responsive Creator - {organization.name} | Dogu</title>
      </Head>
      <Box>
        <H4>{`Mobile vendor`}</H4>
        <SelectSectionBox>
          <DeviceVendorSelector />
          <VendorMarketShare />
        </SelectSectionBox>
        <Centered>
          <WebAddressInput />
          <RunButton
            onClick={async () => {
              await createWebResponsive({
                organizationId: organization.organizationId,
                vendors: selectedVendors,
                urls: ['https://www.google.com'],
              });
            }}
          />
        </Centered>
      </Box>
    </ResponsiveWebTestingContext.Provider>
  );
};

WebResponsiveCreatorPage.getLayout = (page) => {
  return (
    <ConsoleLayout {...page.props} sidebar={<OrganizationSideBar />}>
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps: GetServerSideProps<OrganizationServerSideProps> = async (context) => {
  return {
    notFound: true,
  };

  if (process.env.DOGU_RUN_TYPE === 'self-hosted') {
    return {
      notFound: true,
    };
  }

  return await getOrganizationPageServerSideProps(context);
};

export default WebResponsiveCreatorPage;

const SelectSectionBox = styled.div`
  display: flex;
  justify-content: center;
  gap: 4vw;
`;

const RunSectionBox = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
`;

const TitleBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 3rem;
  flex-shrink: 0;
  width: 100%;
  height: 3rem;
`;

const StyledHr = styled.hr`
  display: block;
  height: 2px;
  background-color: ${(props) => props.theme.colors.gray2};
  border: none;
`;

const Box = styled.div`
  width: 100%;
`;

const Centered = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  margin-bottom: 1rem;
  height: 100%;
`;
