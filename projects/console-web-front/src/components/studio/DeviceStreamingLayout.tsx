import { MobileOutlined } from '@ant-design/icons';
import { DeviceBase, ProjectBase, UserBase } from '@dogu-private/console';
import { DeviceId, OrganizationId, ProjectId } from '@dogu-private/types';
import { Avatar, Tag, Tooltip } from 'antd';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useWebSocket from '../../hooks/useWebSocket';
import { flexRowBaseStyle, flexRowCenteredStyle } from '../../styles/box';
import { getErrorMessageFromAxios } from '../../utils/error';
import ErrorBox from '../common/boxes/ErrorBox';
import ProfileImage from '../ProfileImage';
import DeviceStreaming from '../streaming/DeviceStreaming';
import StudioDeviceSelector from './StudioDeviceSelector';

export interface DeviceStreamingLayoutProps {
  project: ProjectBase;
  deviceId: DeviceId;
  right: React.ReactNode;
  title: string;
  screenViewer: React.ReactNode;
  hideDeviceSelector?: boolean;
}

const DeviceStreamingLayout = ({ project, deviceId, right, title, screenViewer, hideDeviceSelector }: DeviceStreamingLayoutProps) => {
  const router = useRouter();
  const {
    data: device,
    error: deviceError,
    isLoading: deviceIsLoading,
  } = useSWR<DeviceBase>(`/organizations/${project.organizationId}/devices/${deviceId}`, swrAuthFetcher, { revalidateOnFocus: false });
  const websocket = useWebSocket(`/ws/device-streaming-session?organizationId=${project.organizationId}&deviceId=${deviceId}`);
  const [users, setUsers] = useState<UserBase[]>([]);

  useEffect(() => {
    if (websocket.current) {
      websocket.current.onmessage = (event) => {
        const data: { users: UserBase[] } = JSON.parse(event.data);
        setUsers(data.users);
      };

      return () => {
        console.log('close');
        websocket.current?.close();
      };
    }
  }, []);

  if (deviceError) {
    return (
      <Box style={{ justifyContent: 'center' }}>
        <ErrorBox title="Something went wrong" desc={isAxiosError(deviceError) ? getErrorMessageFromAxios(deviceError) : 'Cannot find device information'} />
      </Box>
    );
  }

  if (device && device.displayError !== null) {
    return (
      <Box style={{ justifyContent: 'center' }}>
        <ErrorBox title="Something went wrong" desc={`Device Error: ${device.displayError}`} />
      </Box>
    );
  }

  return (
    <DeviceStreaming device={device}>
      <Box>
        <ScreenBox>
          <TitleBox>
            <h3>{title}</h3>
            <Avatar.Group>
              {users.map((user) => (
                <Tooltip title={user.name}>
                  <ProfileImage key={user.userId} name={user.name} profileImageUrl={user.profileImageUrl} size={32} />
                </Tooltip>
              ))}
            </Avatar.Group>
          </TitleBox>
          {!hideDeviceSelector && (
            <SelectorBox>
              <Tag color="geekblue" icon={<MobileOutlined />}>
                Device
              </Tag>
              <StudioDeviceSelector
                selectedDevice={device ?? undefined}
                organizationId={router.query.orgId as OrganizationId}
                projectId={router.query.pid as ProjectId}
                onSelectedDeviceChanged={(device) => {
                  if (device) {
                    router.push({ query: { orgId: router.query.orgId, pid: router.query.pid, deviceId: device?.deviceId, tab: router.query.tab } });
                  } else {
                    router.push(`/dashboard/${router.query.orgId}/projects/${router.query.pid}/studio`);
                  }
                }}
              />
            </SelectorBox>
          )}
          {screenViewer}
        </ScreenBox>
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

const ScreenBox = styled.div`
  width: 50%;
  padding: 1rem;
  ${flexRowCenteredStyle}
  flex-direction: column;
  height: 100%;

  border-right: 1px solid #e5e5e5;
`;

const ToolBox = styled.div`
  padding: 1rem;
  width: 50%;
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

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
