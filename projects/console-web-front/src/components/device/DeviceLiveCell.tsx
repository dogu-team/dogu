import { DesktopOutlined, MobileOutlined } from '@ant-design/icons';
import { DeviceBase } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import { isDesktop } from '../../utils/device';
import DeviceStreaming from '../streaming/DeviceStreaming';
import PlatformIcon from './PlatformIcon';

const DeviceIcon = ({ platform }: { platform: Platform }) => {
  switch (platform) {
    case Platform.PLATFORM_ANDROID:
    case Platform.PLATFORM_IOS:
      return <MobileOutlined />;
    case Platform.PLATFORM_LINUX:
    case Platform.PLATFORM_MACOS:
    case Platform.PLATFORM_WINDOWS:
      return <DesktopOutlined />;
    default:
      return null;
  }
};

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
        <FlexRow style={{ marginBottom: '.25rem' }}>
          <DeviceIcon platform={device.platform} />
          <DeviceName style={{ marginLeft: '.25rem' }}>{device.name}</DeviceName>
        </FlexRow>
        <FlexRow>
          <PlatformIcon platform={device.platform} />
          <DeviceVersion>{`(${device.version})`}</DeviceVersion>
          <Model>{device.modelName ? `${device.modelName} (${device.model})` : device.model}</Model>
        </FlexRow>
      </ContentWrapper>
      <VideoWrapper style={{ height: isDesktop(device) ? '550px' : '400px' }}>
        <DeviceStreaming.Video style={{ alignItems: 'center' }} readonly />
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
  margin-left: 0.15rem;
  font-size: 0.85rem;
`;

const DeviceName = styled.b`
  display: block;
  font-weight: 600;
`;

const Model = styled.p`
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.gray6};
`;

const VideoWrapper = styled.div`
  height: 400px;
`;
