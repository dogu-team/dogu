import { DeviceBase, ProjectBase } from '@dogu-private/console';
import { DeviceId, OrganizationId, ProjectId } from '@dogu-private/types';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { flexRowCenteredStyle } from '../../styles/box';
import { StreamingTabMenuKey } from '../../types/streaming';
import DeviceSelector from '../device/DeviceSelector';
import DeviceStreaming from '../streaming/DeviceStreaming';
import InspectorSelectedNode from '../streaming/InspectorSelectedNode';
import StudioDeviceSelector from './StudioDeviceSelector';

const ScreenViewer = () => {
  const router = useRouter();
  const { videoRef, loading, inspector, device } = useDeviceStreamingContext();
  const tab = (router.query.tab as StreamingTabMenuKey | undefined) ?? StreamingTabMenuKey.INFO;

  const isLandscape = videoRef?.current ? videoRef.current.videoWidth > videoRef.current.videoHeight : false;

  return (
    <VideoWrapper isLandscape={isLandscape}>
      <SelectorBox>
        <p style={{ marginRight: '.25rem' }}>Device:</p>
        <StudioDeviceSelector
          selectedDevice={device ?? undefined}
          organizationId={router.query.orgId as OrganizationId}
          projectId={router.query.pid as ProjectId}
          onSelectedDeviceChanged={(device) => {
            if (device) {
              router.push({ query: { orgId: router.query.orgId, pid: router.query.pid, deviceId: device?.deviceId } });
            } else {
              router.push(`/dashboard/${router.query.orgId}/projects/${router.query.pid}/studio`);
            }
          }}
        />
      </SelectorBox>
      <div style={{ height: 'calc(100% - 2rem)' }}>
        <DeviceStreaming.Video inspector={inspector ?? undefined} rightSidebar={loading ? null : <DeviceStreaming.Controlbar />}>
          {tab === StreamingTabMenuKey.INSPECTOR && !!inspector && inspector.inspectingNode && <InspectorSelectedNode nodeInfo={inspector.inspectingNode} />}
        </DeviceStreaming.Video>
      </div>
    </VideoWrapper>
  );
};

export interface DeviceStreamingLayoutProps {
  project: ProjectBase;
  deviceId: DeviceId;
  right: React.ReactNode;
}

const DeviceStreamingLayout = ({ project, deviceId, right }: DeviceStreamingLayoutProps) => {
  const {
    data: device,
    error: deviceError,
    isLoading: deviceIsLoading,
  } = useSWR<DeviceBase>(`/organizations/${project.organizationId}/devices/${deviceId}`, swrAuthFetcher, { revalidateOnFocus: false });

  if (deviceError) {
    return <div>Something went wrong...</div>;
  }

  return (
    <DeviceStreaming device={device}>
      <Box>
        <ScreenBox>
          <ScreenViewer />
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
  height: 100%;

  border-right: 1px solid #e5e5e5;
`;

const ToolBox = styled.div`
  padding: 1rem;
  width: 50%;
`;

const VideoWrapper = styled.div<{ isLandscape: boolean }>`
  flex: 1;
  width: ${(props) => (props.isLandscape ? '100%' : '80%')};
  height: 95%;
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
