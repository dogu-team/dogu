import { DeviceRunnerBase } from '@dogu-private/console';
import styled from 'styled-components';

interface Props {
  runner: DeviceRunnerBase;
}

const RunnerUsageStatusBadge: React.FC<Props> = ({ runner }) => {
  if (runner.isInUse) {
    return (
      <Box style={{ backgroundColor: '#6499f533' }}>
        <Text style={{ color: '#6499f5' }}>Running</Text>
      </Box>
    );
  }

  return (
    <Box style={{ backgroundColor: '#cffaca' }}>
      <Text style={{ color: '#15a803' }}>Idle</Text>
    </Box>
  );
};

export default RunnerUsageStatusBadge;

const Box = styled.div`
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 20px;
  align-items: center;
`;

const Text = styled.p`
  font-size: 0.85rem;
`;
