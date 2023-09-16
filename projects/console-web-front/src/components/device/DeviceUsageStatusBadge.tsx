import { DeviceBase } from '@dogu-private/console';
import { DeviceConnectionState } from '@dogu-private/types';
import { PIPELINE_STATUS } from '@dogu-private/types';
import styled from 'styled-components';

interface Props {
  device: DeviceBase;
}

const DeviceUsageStatusBadge = ({ device }: Props) => {
  if (
    device.connectionState === DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED ||
    device.connectionState === DeviceConnectionState.UNRECOGNIZED
  ) {
    return (
      <Box style={{ backgroundColor: '#bbbbbb33' }}>
        <Text style={{ color: '#bbbbbb' }}>Unknown</Text>
      </Box>
    );
  }

  if (!device.routineDeviceJobs) {
    return (
      <Box style={{ backgroundColor: '#bbbbbb33' }}>
        <Text style={{ color: '#bbbbbb' }}>Unknown</Text>
      </Box>
    );
  }

  if (device.routineDeviceJobs.length === 0) {
    return (
      <Box style={{ backgroundColor: '#cffaca' }}>
        <Text style={{ color: '#15a803' }}>Idle</Text>
      </Box>
    );
  }

  if (
    device.routineDeviceJobs.filter(
      (job) => job.status === PIPELINE_STATUS.IN_PROGRESS || job.status === PIPELINE_STATUS.CANCEL_REQUESTED,
    ).length > 0
  ) {
    return (
      <Box style={{ backgroundColor: '#6499f533' }}>
        <Text style={{ color: '#6499f5' }}>Running</Text>
      </Box>
    );
  }

  return (
    <Box style={{ backgroundColor: '#fcba0333' }}>
      <Text style={{ color: '#fcba03' }}>{`Waiting (${
        device.routineDeviceJobs.filter((job) => job.status === PIPELINE_STATUS.WAITING).length
      })`}</Text>
    </Box>
  );
};

export default DeviceUsageStatusBadge;

const Box = styled.div`
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 20px;
  align-items: center;
`;

const Text = styled.p`
  font-size: 0.85rem;
`;
