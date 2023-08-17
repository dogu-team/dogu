import { DeviceBase } from '@dogu-private/console';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../styles/box';

import DeviceStreaming from '../streaming/DeviceStreaming';
import PlatformIcon from './PlatformIcon';

interface Props {
  device: DeviceBase | undefined;
}

const DeviceLiveCell = ({ device }: Props) => {
  if (!device) {
    return (
      <div>
        <div>Device not found</div>
      </div>
    );
  }

  return (
    <DeviceStreaming device={device}>
      <ContentWrapper>
        <FlexRow>
          <PlatformIcon platform={device.platform} />
          <DeviceVersion>{device.version}</DeviceVersion>
        </FlexRow>
        <DeviceName>{device.name}</DeviceName>
        <Model>{device.modelName ? `${device.modelName} (${device.model})` : device.model}</Model>
      </ContentWrapper>
      <VideoWrapper>
        <DeviceStreaming.Video style={{ alignItems: 'center' }} />
      </VideoWrapper>
    </DeviceStreaming>
  );
};

export default DeviceLiveCell;

const ContentWrapper = styled.div`
  margin-bottom: 0.5rem;
  line-height: 1.5;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const DeviceVersion = styled.p`
  margin-left: 0.25rem;
  font-size: 0.85rem;
`;

const DeviceName = styled.b`
  font-weight: 600;
`;

const Model = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.gray6};
`;

const VideoWrapper = styled.div`
  height: 400px;
`;
