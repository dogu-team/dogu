import { DeviceBase, ProjectBase } from '@dogu-private/console';
import { DeviceId } from '@dogu-private/types';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { flexRowCenteredStyle } from '../../styles/box';
import { StreamingTabMenuKey } from '../../types/streaming';
import DeviceStreaming from '../streaming/DeviceStreaming';
import InspectorSelectedNode from '../streaming/InspectorSelectedNode';

const ScreenViewer = () => {
  const router = useRouter();
  const { videoRef, loading, inspector } = useDeviceStreamingContext();
  const tab = (router.query.tab as StreamingTabMenuKey | undefined) ?? StreamingTabMenuKey.INFO;

  const isLandscape = videoRef?.current ? videoRef.current.videoWidth > videoRef.current.videoHeight : false;

  return (
    <VideoWrapper isLandscape={isLandscape}>
      <DeviceStreaming.Video inspector={inspector ?? undefined} rightSidebar={loading ? null : <DeviceStreaming.Controlbar />}>
        {tab === StreamingTabMenuKey.INSPECTOR && !!inspector && inspector.inspectingNode && <InspectorSelectedNode nodeInfo={inspector.inspectingNode} />}
      </DeviceStreaming.Video>
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
  height: 90%;
`;

const RightWrapper = styled.div`
  height: 100%;
  overflow: hidden;
`;
