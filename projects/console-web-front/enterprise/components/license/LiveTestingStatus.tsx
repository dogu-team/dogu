import { CloudLicenseBase } from '@dogu-private/console';
import styled from 'styled-components';

interface Props {
  license: CloudLicenseBase;
  usingSessionCount: number;
}

const LiveTestingStatus: React.FC<Props> = ({ license, usingSessionCount }) => {
  return (
    <Box>
      Live sessions: {usingSessionCount} / {license.liveTestingParallelCount}
    </Box>
  );
};

export default LiveTestingStatus;

const Box = styled.div`
  line-height: 1.5;
`;
