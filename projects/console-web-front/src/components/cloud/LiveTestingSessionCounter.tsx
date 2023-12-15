import { LiveSessionBase } from '@dogu-private/console';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api/index';
import useLicenseStore from '../../stores/license';

interface Props {}

const LiveTestingSessionCounter: React.FC<Props> = () => {
  const license = useLicenseStore((state) => state.license);
  const { data } = useSWR<LiveSessionBase[]>(
    license?.organizationId && `/organizations/${license?.organizationId}/live-sessions`,
    swrAuthFetcher,
    {
      refreshInterval: 10000,
    },
  );

  if (!license) {
    return null;
  }

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
