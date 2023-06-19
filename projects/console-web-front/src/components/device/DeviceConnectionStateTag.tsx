import { Tag } from 'antd';
import { DeviceConnectionState } from '@dogu-private/types';
import styled from 'styled-components';

import { deviceConnectionStateTextColorMap, mapDeviceConnectionStateToString } from 'src/utils/mapper';
import { CheckSquareOutlined, DisconnectOutlined, QuestionCircleOutlined } from '@ant-design/icons';

interface Props {
  connectionState: DeviceConnectionState;
}

const DeviceConnectionStateTag = ({ connectionState }: Props) => {
  const text = mapDeviceConnectionStateToString(connectionState);

  switch (connectionState) {
    case DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED:
      return (
        <Box style={{ backgroundColor: '#fff2f0' }}>
          <DisconnectOutlined style={{ color: deviceConnectionStateTextColorMap[text] }} />
          <Text style={{ color: deviceConnectionStateTextColorMap[text] }}>Offline</Text>
        </Box>
      );
    case DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED:
      return (
        <Box style={{ backgroundColor: '#cffaca' }}>
          <CheckSquareOutlined style={{ color: deviceConnectionStateTextColorMap[text] }} />
          <Text style={{ color: deviceConnectionStateTextColorMap[text] }}>Online</Text>
        </Box>
      );
    default:
      return (
        <Box style={{ backgroundColor: '#ededed' }}>
          <QuestionCircleOutlined style={{ color: deviceConnectionStateTextColorMap[text] }} />
          <Text style={{ color: deviceConnectionStateTextColorMap[text] }}>Unknown</Text>
        </Box>
      );
  }
};

export default DeviceConnectionStateTag;

const Box = styled.div`
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 20px;
  align-items: center;
`;

const Text = styled.p`
  font-size: 0.85rem;
  margin-left: 0.25rem;
`;
