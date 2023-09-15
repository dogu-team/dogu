import { GetServerSideProps } from 'next';
import styled from 'styled-components';

import { NextPageWithLayout } from 'pages/_app';
import ManualTesting from 'src/components/studio/ManualTesting';
import {
  getStudioTestingLayout,
  getStudioTestingServerSideProps,
  StudioTestingPageProps,
} from 'enterprise/pages/studio';

const StudioManualPage: NextPageWithLayout<StudioTestingPageProps> = ({ organization, project, me, deviceId }) => {
  return (
    <Box>
      <ManualTesting organization={organization} project={project} deviceId={deviceId} me={me} />
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
