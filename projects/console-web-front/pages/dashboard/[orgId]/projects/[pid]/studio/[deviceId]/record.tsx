import { GetServerSideProps } from 'next';

import RecordTesting from '../../../../../../../enterprise/components/studio/RecordTesting';
import { getStudioTestingLayout, StudioTestingPageProps } from '../../../../../../../enterprise/pages/studio';
import { NextPageWithLayout } from '../../../../../../_app';

const RecordTestingPage: NextPageWithLayout<StudioTestingPageProps> = ({ organization, me, device }) => {
  return <RecordTesting organization={organization} device={device} me={me} />;
};

RecordTestingPage.getLayout = getStudioTestingLayout;

export const getServerSideProps: GetServerSideProps<StudioTestingPageProps> = async (context) => {
  return {
    notFound: true,
  };
};

export default RecordTestingPage;
