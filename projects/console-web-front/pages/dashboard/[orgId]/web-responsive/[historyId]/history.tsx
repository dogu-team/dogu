import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import { getOrganizationPageServerSideProps, OrganizationServerSideProps } from 'src/ssr/organization';
import Canvas from '../../../../../src/components/web-responsive/canvas/Canvas';

const ResponsiveWebTestingHistoryPage: NextPageWithLayout<OrganizationServerSideProps> = ({ user, organization }) => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>Responsive Web Testing - {organization.name} | Dogu</title>
      </Head>
      <Box>
        <Canvas />
      </Box>
    </>
  );
};

ResponsiveWebTestingHistoryPage.getLayout = (page) => {
  return (
    <ConsoleLayout padding="0px" {...page.props} sidebar={<OrganizationSideBar />}>
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

export default ResponsiveWebTestingHistoryPage;

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
  height: 100%;
`;

const Centered = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  margin-bottom: 1rem;
  height: 100%;
`;
