import { OrganizationBase, ProjectBase, UserBase } from '@dogu-private/console';
import { DeviceId, Platform } from '@dogu-private/types';
import { Tabs, TabsProps } from 'antd';
import { GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import styled from 'styled-components';

import { getOrganizationInServerSide } from 'src/api/organization';
import { getProjectInServerSide } from 'src/api/project';
import { getUserInServerSide } from 'src/api/registery';
import ResizableLayout from 'src/components/layouts/ResizableLayout';
import DeviceStreaming from 'src/components/streaming/DeviceStreaming';
import DeviceStreamingGraphContainer from 'src/components/streaming/DeviceStreamingGraphContainer';
import DeviceStreamingLogContainer from 'src/components/streaming/DeviceStreamingLogContainer';
import InspectorSelectedNode from 'src/components/streaming/InspectorSelectedNode';
import useDeviceLog from 'src/hooks/streaming/useDeviceLog';
import useDeviceStreamingContext from 'src/hooks/streaming/useDeviceStreamingContext';
import useDeviceStreamingProfile from 'src/hooks/streaming/useDeviceStreamingProfile';
import useInspector from 'src/hooks/streaming/useInspector';
import useResizePreference from 'src/hooks/useResizePreference';
import { StreamingTabMenuKey } from 'src/types/streaming';
import { NextPageWithLayout } from 'pages/_app';
import StudioLayout from 'src/components/studio/StudioLayout';
import ManualTesting from '../../../../../../src/components/studio/ManualTesting';

const StreamingViewer = () => {
  const router = useRouter();
  const { device, videoRef, deviceService, loading } = useDeviceStreamingContext();
  const tab = (router.query.tab as StreamingTabMenuKey | undefined) ?? StreamingTabMenuKey.INFO;
  const inspector = useInspector(deviceService?.deviceInspector, device, videoRef);
  const runtimeInfos = useDeviceStreamingProfile(deviceService?.deviceClient, device ?? null);
  const { deviceLogs, isLogStopped, logFilterValue, togglePlay, handleChangeFilterValue, clearLog } = useDeviceLog(deviceService?.deviceClient, device ?? null);
  const { initWidth, saveWidth } = useResizePreference('device-streaming-menu-width', 300);
  const boxRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const getTabMenu = (platform: Platform): { left: TabsProps['items']; bottom: TabsProps['items'] } => {
    const tabMenu: TabsProps['items'] = [];

    const infoTab: NonNullable<TabsProps['items']>[number] = {
      key: StreamingTabMenuKey.INFO,
      label: <div>{t('device-streaming:tabMenuInfo')}</div>,
      style: { width: '100%', height: '100%' },
      children: <DeviceStreaming.BasicMenu />,
    };
    const inspectorTab: NonNullable<TabsProps['items']>[number] = {
      key: StreamingTabMenuKey.INSPECTOR,
      label: <div>{t('device-streaming:tabMenuInspector')}</div>,
      style: { width: '100%', height: '100%' },
      children: device ? <DeviceStreaming.Inspector inspector={inspector} /> : null,
    };
    const installTab: NonNullable<TabsProps['items']>[number] = {
      key: StreamingTabMenuKey.INSTALL,
      label: <div>{t('device-streaming:tabMenuAppInstallation')}</div>,
      style: { width: '100%', height: '100%' },
      children: device ? <DeviceStreaming.AppInstaller /> : null,
    };
    const profileTab: NonNullable<TabsProps['items']>[number] = {
      key: StreamingTabMenuKey.PROFILE,
      label: <div>{t('device-streaming:tabMenuProfile')}</div>,
      style: { width: '100%', height: '100%' },
      children: <DeviceStreamingGraphContainer infos={runtimeInfos} />,
    };
    const logTab: NonNullable<TabsProps['items']>[number] = {
      key: StreamingTabMenuKey.LOGS,
      label: <div>{t('device-streaming:tabMenuLog')}</div>,
      style: { width: '100%', height: '100%' },
      children: (
        <DeviceStreamingLogContainer
          filterValue={logFilterValue}
          deviceLogs={deviceLogs}
          onChangeFilterValue={handleChangeFilterValue}
          isStopped={isLogStopped}
          onTogglePlay={togglePlay}
          clearLog={clearLog}
        />
      ),
    };

    switch (platform) {
      case Platform.PLATFORM_ANDROID:
        return { left: [infoTab, inspectorTab, installTab], bottom: [profileTab, logTab] };
      case Platform.PLATFORM_IOS:
        return { left: [infoTab, inspectorTab, installTab], bottom: [profileTab, logTab] };
      case Platform.PLATFORM_MACOS:
        return { left: [infoTab], bottom: [profileTab] };
      case Platform.PLATFORM_WINDOWS:
        return { left: [infoTab], bottom: [profileTab] };
      default:
        return { left: [infoTab], bottom: [] };
    }
  };

  const { left, bottom } = getTabMenu(device?.platform ?? Platform.UNRECOGNIZED);

  return (
    <ViewerBox ref={boxRef}>
      <div style={{ height: 'calc(100vh - 57px - 10rem)' }}>
        <ResizableLayout
          initFirstSize={initWidth}
          direction="horizontal"
          first={
            <MenuBox>
              <Tabs
                defaultActiveKey={tab}
                items={left}
                style={{ height: '100%' }}
                destroyInactiveTabPane
                activeKey={tab}
                onChange={(key) => {
                  router.push({ pathname: router.pathname, query: { ...router.query, tab: key } }, undefined, { shallow: true });
                }}
              />
            </MenuBox>
          }
          firstStyle={{ height: '100%' }}
          firstMinSize={boxRef.current?.clientWidth ? boxRef.current.clientWidth * 0.2 : undefined}
          firstMaxSize={boxRef.current?.clientWidth ? boxRef.current.clientWidth * 0.5 : undefined}
          lastStyle={{ flex: 1, height: '100%' }}
          last={
            <DeviceStreaming.Video inspector={inspector} rightSidebar={loading ? null : <DeviceStreaming.Controlbar />}>
              {tab === StreamingTabMenuKey.INSPECTOR && inspector.inspectingNode && <InspectorSelectedNode nodeInfo={inspector.inspectingNode} />}
            </DeviceStreaming.Video>
          }
          onResize={saveWidth}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <Tabs items={bottom} defaultActiveKey={StreamingTabMenuKey.PROFILE} destroyInactiveTabPane />
      </div>
    </ViewerBox>
  );
};

interface StudioToolServerSideProps {
  organization: OrganizationBase;
  project: ProjectBase;
  me: UserBase;
  deviceId: DeviceId | null;
}

const StudioManualPage: NextPageWithLayout<StudioToolServerSideProps> = ({ organization, project, me, deviceId }) => {
  // const router = useRouter();
  // const {
  //   data: device,
  //   error: deviceError,
  //   isLoading: deviceIsLoading,
  // } = useSWR<DeviceBase>(router.query.deviceId && `/organizations/${router.query.orgId}/devices/${router.query.deviceId}`, swrAuthFetcher, { revalidateOnFocus: false });
  // const { t } = useTranslation();

  // useEffect(() => {
  //   const unsub = useStreamingOptionStore.subscribe(({ option }, { option: prevOption }) => {
  //     if (option.fps !== prevOption.fps || option.resolution !== prevOption.resolution) {
  //       // router.reload();
  //     }
  //   });

  //   return () => {
  //     unsub();
  //   };
  // }, []);

  if (!deviceId) {
    return <div>Select your device first</div>;
  }

  return (
    <Box>
      <ManualTesting organization={organization} project={project} deviceId={deviceId} />
    </Box>
  );
};

StudioManualPage.getLayout = (page) => {
  return <StudioLayout project={page.props.project}>{page}</StudioLayout>;
};

export const getServerSideProps: GetServerSideProps<StudioToolServerSideProps> = async (context) => {
  try {
    const [organization, project, user] = await Promise.all([getOrganizationInServerSide(context), getProjectInServerSide(context), getUserInServerSide(context)]);

    return {
      props: {
        organization,
        project,
        me: user,
        deviceId: (context.query.deviceId as DeviceId) ?? null,
      },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }
};

export default StudioManualPage;

const Box = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
`;

const MenuBox = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;

  .ant-tabs-content.ant-tabs-content-top {
    height: 100%;
  }
`;

const ViewerBox = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;
