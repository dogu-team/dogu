import { GetServerSideProps } from 'next';

import { IS_CLOUD, NextPageWithLayout } from 'pages/_app';
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
    redirect: redirectWithLocale(
      context,
      IS_CLOUD ? `/dashboard/${context.query.orgId}/live-testing` : `/dashboard/${context.query.orgId}/projects`,
      true,
    ),
  };
};

export default OrganizationPage;
