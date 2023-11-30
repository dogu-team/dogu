import { GetServerSideProps } from 'next';
import styled from 'styled-components';

import { NextPageWithLayout } from 'pages/_app';
import LiveTesting from 'src/components/studio/LiveTesting';
import {
  StudioTestingPageProps,
  getStudioTestingServerSideProps,
  getStudioTestingLayout,
} from 'enterprise/pages/studio';

const DeviceFarmLiveTestingPage: NextPageWithLayout<StudioTestingPageProps> = ({ organization, me, device }) => {
  return (
    <Box>
      <LiveTesting organization={organization} device={device} me={me} />
    </Box>
  );
};

DeviceFarmLiveTestingPage.getLayout = getStudioTestingLayout;

export const getServerSideProps: GetServerSideProps<StudioTestingPageProps> = getStudioTestingServerSideProps;

export default DeviceFarmLiveTestingPage;

const Box = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  flex: 1;
`;
