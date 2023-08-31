import { GetServerSideProps } from 'next';

import { NextPageWithLayout } from 'pages/_app';
import ConsoleLayout from 'src/components/layouts/ConsoleLayout';
import OrganizationSideBar from 'src/components/layouts/OrganizationSideBar';
import { redirectWithLocale } from '../../../src/ssr/locale';

const OrganizationPage: NextPageWithLayout = () => {
  return <div></div>;
};

OrganizationPage.getLayout = (page) => {
  // return <ConsoleLayout sidebar={<OrganizationSideBar />}>{page}</ConsoleLayout>;
  return page;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: redirectWithLocale(context, `/dashboard/${context.query.orgId}/projects`, true),
  };
};

export default OrganizationPage;
