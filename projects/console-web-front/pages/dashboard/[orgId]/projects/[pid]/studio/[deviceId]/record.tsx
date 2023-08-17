import { GetServerSideProps } from 'next';

import RecordTesting from '../../../../../../../src/enterprise/components/studio/RecordTesting';
import { getStudioTestingLayout, getStudioTestingServerSideProps, StudioTestingPageProps } from '../../../../../../../src/enterprise/pages/studio';
import { NextPageWithLayout } from '../../../../../../_app';

const RecordTestingPage: NextPageWithLayout<StudioTestingPageProps> = ({ organization, project, me, deviceId }) => {
  return <RecordTesting organization={organization} project={project} deviceId={deviceId} />;
};

RecordTestingPage.getLayout = getStudioTestingLayout;

export const getServerSideProps: GetServerSideProps<StudioTestingPageProps> = getStudioTestingServerSideProps;

export default RecordTestingPage;