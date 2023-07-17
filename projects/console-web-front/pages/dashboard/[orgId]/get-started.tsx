import { GetServerSideProps } from 'next';
import ConsoleBasicLayout from '../../../src/components/layouts/ConsoleBasicLayout';
import { NextPageWithLayout } from '../../_app';

const OrganizationTutorialPage: NextPageWithLayout = () => {
  return <div>Organization Tutorial</div>;
};

OrganizationTutorialPage.getLayout = (page) => {
  return <ConsoleBasicLayout>{page}</ConsoleBasicLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {},
  };
};

export default OrganizationTutorialPage;
