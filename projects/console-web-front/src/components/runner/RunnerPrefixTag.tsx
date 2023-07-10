import { DeviceBase } from '@dogu-private/console';
import { Tag } from 'antd';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';

interface Props {
  device: DeviceBase;
}

const RunnerPrefixTag = ({ device }: Props) => {
  return (
    <Box>
      {device.isGlobal === 1 && <Tag style={{ backgroundColor: '#ffcc00', color: '#000', border: 'none' }}>Public</Tag>}
      {device.isHost === 1 && <Tag style={{ backgroundColor: '#6499f5', color: '#000', border: 'none' }}>Host</Tag>}
    </Box>
  );
};

export default RunnerPrefixTag;

const Box = styled.div`
  ${flexRowBaseStyle}

  & > * {
    margin-right: 0.25rem;
  }
`;
