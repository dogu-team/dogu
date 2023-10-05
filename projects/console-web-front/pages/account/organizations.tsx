import { UserBase } from '@dogu-private/console';
import { Divider } from 'antd';
import { GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import styled from 'styled-components';
import { SWRConfig } from 'swr';

import TableListView from '../../src/components/common/TableListView';
import ConsoleBasicLayout from '../../src/components/layouts/ConsoleBasicLayout';
import Footer from '../../src/components/layouts/Footer';
import OrganizationListController from '../../src/components/organizations/OrganizationListController';
import useAuth from '../../src/hooks/useAuth';
import { checkUserVerifiedInServerSide } from '../../src/utils/auth';
import { NextPageWithLayout } from '../_app';

interface Props {
  fallback: {
    [key: string]: UserBase;
  };
}

const OrganizationListPage: NextPageWithLayout<Props> = ({ fallback }) => {
  const { me, isLoading, error } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return null;
  }

  if (!me || error) {
    return null;
  }

  return (
    <SWRConfig value={{ fallback }}>
      <Head>
        <title>My organizations | Dogu</title>
      </Head>
      <Box>
        <StyledH2>{t('account:myOrganizationPageTitle')}</StyledH2>
        <Divider />
        <TableListView top={<div></div>} table={<OrganizationListController />} />
      </Box>
    </SWRConfig>
  );
};

OrganizationListPage.getLayout = (page) => {
  return (
    <ConsoleBasicLayout>
      {page}
      <Footer />
    </ConsoleBasicLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const result = await checkUserVerifiedInServerSide(context);

  return result;
};

export default OrganizationListPage;

const Box = styled.div`
  flex: 1;
  padding: 24px 32px;
`;

const StyledH2 = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
`;
