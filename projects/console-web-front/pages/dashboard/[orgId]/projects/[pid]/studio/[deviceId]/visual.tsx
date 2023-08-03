import { GetServerSideProps } from 'next';

import VisualTesting from '../../../../../../../src/enterprise/components/studio/VisualTesting';

import { getStudioTestingLayout, getStudioTestingServerSideProps, StudioTestingPageProps } from '../../../../../../../src/enterprise/pages/studio';
import { NextPageWithLayout } from '../../../../../../_app';

const VisualTestingPage: NextPageWithLayout<StudioTestingPageProps> = ({ organization, project, me, deviceId }) => {
  return <VisualTesting organization={organization} project={project} deviceId={deviceId} />;
};

VisualTestingPage.getLayout = getStudioTestingLayout;

export const getServerSideProps: GetServerSideProps<StudioTestingPageProps> = getStudioTestingServerSideProps;

export default VisualTestingPage;
