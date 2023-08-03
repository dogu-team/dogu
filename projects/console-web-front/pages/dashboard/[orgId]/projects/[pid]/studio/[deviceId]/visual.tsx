import { GetServerSideProps } from 'next';

import { getStudioTestingLayout, getStudioTestingServerSideProps, StudioTestingPageProps } from '../../../../../../../src/enterprise/pages/studio';
import { NextPageWithLayout } from '../../../../../../_app';

const VisualTestingPage: NextPageWithLayout<StudioTestingPageProps> = ({ organization, project, me, deviceId }) => {
  return <div>{deviceId}</div>;
};

VisualTestingPage.getLayout = getStudioTestingLayout;

export const getServerSideProps: GetServerSideProps<StudioTestingPageProps> = getStudioTestingServerSideProps;

export default VisualTestingPage;
