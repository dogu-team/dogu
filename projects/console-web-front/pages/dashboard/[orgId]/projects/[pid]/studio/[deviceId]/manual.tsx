import { GetServerSideProps } from 'next';
import styled from 'styled-components';

import { NextPageWithLayout } from 'pages/_app';
import ManualTesting from 'src/components/studio/LiveTesting';
import {
  getStudioTestingLayout,
  getStudioTestingServerSideProps,
  StudioTestingPageProps,
} from 'enterprise/pages/studio';

const StudioManualPage: NextPageWithLayout<StudioTestingPageProps> = ({ organization, project, me, device }) => {
  return (
    <Box>
      <ManualTesting organization={organization} device={device} me={me} />
    </Box>
  );
};

StudioManualPage.getLayout = getStudioTestingLayout;

export const getServerSideProps: GetServerSideProps<StudioTestingPageProps> = getStudioTestingServerSideProps;

export default StudioManualPage;

const Box = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  flex: 1;
`;
