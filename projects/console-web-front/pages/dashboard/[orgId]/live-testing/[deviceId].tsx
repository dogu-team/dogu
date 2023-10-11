import { GetServerSideProps } from 'next';
import styled from 'styled-components';

import { NextPageWithLayout } from 'pages/_app';
import ManualTesting from 'src/components/studio/ManualTesting';
import {
  getCloudDeviceStudioTestingServerSideProps,
  getStudioTestingLayout,
  CloudStudioTestingPageProps,
} from 'enterprise/pages/studio';

const CloudLiveTestingStudioPage: NextPageWithLayout<CloudStudioTestingPageProps> = ({
  organization,
  me,
  deviceId,
}) => {
  return (
    <Box>
      <ManualTesting organization={organization} deviceId={deviceId} me={me} hideDeviceSelector />
    </Box>
  );
};

CloudLiveTestingStudioPage.getLayout = getStudioTestingLayout;

export const getServerSideProps: GetServerSideProps<CloudStudioTestingPageProps> =
  getCloudDeviceStudioTestingServerSideProps;

export default CloudLiveTestingStudioPage;

const Box = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  flex: 1;
`;
