import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { TestExecutorId } from '@dogu-private/types';
import { TestExecutorWebResponsiveSnapshotMap } from '@dogu-private/console';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import Canvas from '../../../../../src/components/web-responsive/canvas/Canvas';
import { OrganizationServerSideProps } from 'src/ssr/organization';
import { getWebResponsiveSnapshotsServerSide } from '../../../../../src/api/test-executor';
import { getOrganizationInServerSide } from '../../../../../src/api/organization';
import { getUserInServerSide } from '../../../../../src/api/registery';
import { getCloudLicenseInServerSide } from '../../../../../enterprise/api/license';

interface ResponsiveWebVeiwerServerSideProps extends OrganizationServerSideProps {
  snapshots: TestExecutorWebResponsiveSnapshotMap;
}

const ResponsiveWebVeiwerPage: NextPageWithLayout<ResponsiveWebVeiwerServerSideProps> = ({
  user,
  organization,
  snapshots,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>Web Responsive - {organization.name} | Dogu</title>
      </Head>
      <Box>
        <Canvas snapshots={snapshots} />
      </Box>
    </>
  );
};

ResponsiveWebVeiwerPage.getLayout = (page) => {
  return (
    <ConsoleLayout padding="0px" {...page.props} sidebar={<OrganizationSideBar />}>
      {page}
    </ConsoleLayout>
  );
};

export const getServerSideProps: GetServerSideProps<ResponsiveWebVeiwerServerSideProps> = async (context) => {
  if (process.env.DOGU_RUN_TYPE === 'self-hosted') {
    return {
      notFound: true,
    };
  }

  const webResponsiveId = context.query.executorId as TestExecutorId | undefined;
  if (!webResponsiveId) {
    return {
      notFound: true,
    };
  }

  try {
    const [organization, license, user] = await Promise.all([
      getOrganizationInServerSide(context),
      getCloudLicenseInServerSide(context),
      getUserInServerSide(context),
    ]);
    const snapshots = await getWebResponsiveSnapshotsServerSide(context, {
      organizationId: organization.organizationId,
      testExecutorId: webResponsiveId,
    });

    if (snapshots) {
      return {
        props: {
          organization,
          license,
          user,
          snapshots,
        },
      };
    }
  } catch (error) {
    return {
      notFound: true,
    };
  }

  return {
    notFound: true,
  };
};

export default ResponsiveWebVeiwerPage;

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
