import { CloudLicenseBase, LiveSessionBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import styled from 'styled-components';
import useSWR from 'swr';
import { swrAuthFetcher } from '../../../src/api';

interface Props {
  license: CloudLicenseBase;
  organizationId: OrganizationId;
}

const LiveTestingSessionCounter: React.FC<Props> = ({ license, organizationId }) => {
  const { data } = useSWR<LiveSessionBase[]>(`/organizations/${organizationId}/live-sessions`, swrAuthFetcher, {
    refreshInterval: 10000,
  });

  return (
    <Box>
      Parallel sessions: {data?.length ?? '-'} / {license.liveTestingParallelCount}
    </Box>
  );
};

export default LiveTestingSessionCounter;

const Box = styled.div`
  line-height: 1.5;
  font-size: 0.8rem;
  color: #222;
`;
