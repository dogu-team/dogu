import { DeviceBase, OrganizationBase, UserBase } from '@dogu-private/console';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { flexRowCenteredStyle } from '../../styles/box';
import ErrorBox from '../common/boxes/ErrorBox';
import DeviceControlToolbar from '../streaming/DeviceControlToolbar';
import DeviceStreaming from '../streaming/DeviceStreaming';

export interface DeviceStreamingLayoutProps {
  organization: OrganizationBase;
  userId: UserBase['userId'];
  device: DeviceBase;
  right: React.ReactNode;
  screenViewer: React.ReactNode;
  hideDeviceSelector?: boolean;
  isCloudDevice?: boolean;
}

const DeviceStreamingLayout = ({
  organization,
  userId,
  device,
  right,
  screenViewer,
  hideDeviceSelector,
  isCloudDevice,
}: DeviceStreamingLayoutProps) => {
  const router = useRouter();

  if (device && device.displayError !== null) {
    return (
      <Box style={{ justifyContent: 'center' }}>
        <ErrorBox title="Something went wrong" desc={`Device Error: ${device.displayError}`} />
      </Box>
    );
  }

  return (
    <DeviceStreaming device={device} isCloudDevice={isCloudDevice}>
      <Box>
        <LeftBox>
          <DeviceControlToolbar />
        </LeftBox>
        <ScreenBox>{screenViewer}</ScreenBox>
        <ToolBox>
          <RightWrapper>{right}</RightWrapper>
        </ToolBox>
      </Box>
    </DeviceStreaming>
  );
};

export default DeviceStreamingLayout;

const Box = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  width: 100%;
  position: relative;
`;

const LeftBox = styled.div`
  width: 12rem;
`;

const ScreenBox = styled.div`
  padding: 2rem;
  ${flexRowCenteredStyle}
  flex-direction: column;
  height: 100%;
  background-color: #ededed;
  flex: 1;
`;

const ToolBox = styled.div`
  width: 450px;

  @media screen and (max-width: 1279px) {
    width: 350px;
  }

  @media screen and (max-width: 1023px) {
    width: 300px;
  }
`;

const RightWrapper = styled.div`
  height: 100%;
  overflow: hidden;
`;

const SelectorBox = styled.div`
  ${flexRowCenteredStyle}
  width: 100%;
  margin-bottom: 0.5rem;
`;

const TitleBox = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;

  h3 {
    font-size: 1.35rem;
    font-weight: 600;
    line-height: 1.5;
  }
`;
