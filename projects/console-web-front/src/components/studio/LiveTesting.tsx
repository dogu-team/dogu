import { AreaChartOutlined, CodeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { DeviceBase, OrganizationBase, UserBase } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { LuInspect } from 'react-icons/lu';

import DeviceStreaming from '../streaming/DeviceStreaming';
import { DeviceStreamingLayoutProps } from './DeviceStreamingLayout';
import { StreamingTabMenuKey } from '../../types/streaming';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import DeviceStreamingGraphContainer from '../streaming/DeviceStreamingGraphContainer';
import useDeviceStreamingProfile from '../../hooks/streaming/useDeviceStreamingProfile';
import DeviceStreamingLogContainer from '../streaming/DeviceStreamingLogContainer';
import useDeviceLog from '../../hooks/streaming/useDeviceLog';
import LiveTestingScreenViewer from './LIveTestingScreenViewer';
// @ts-ignore
const DeviceStreamingLayout = dynamic<DeviceStreamingLayoutProps>(() => import('./DeviceStreamingLayout'), {
  ssr: false,
});

const LiveTestingMenu = () => {
  const router = useRouter();
  const { device, deviceService, inspector, isCloudDevice } = useDeviceStreamingContext();
  const runtimeInfos = useDeviceStreamingProfile(deviceService?.deviceClientRef, device ?? null);
  const { t } = useTranslation();
  const { deviceLogs, isLogStopped, logFilterValue, togglePlay, handleChangeFilterValue, clearLog } = useDeviceLog(
    deviceService?.deviceClientRef,
    device ?? null,
  );

  const clickTab = (key: StreamingTabMenuKey) => {
    router.push({ pathname: router.pathname, query: { ...router.query, tab: key } }, undefined, {
      shallow: true,
    });
  };

  const getTabMenu = (platform: Platform): StreamingTabMenuKey[] => {
    switch (platform) {
      case Platform.PLATFORM_ANDROID:
        return [
          StreamingTabMenuKey.INFO,
          StreamingTabMenuKey.INSPECTOR,
          StreamingTabMenuKey.PROFILE,
          StreamingTabMenuKey.LOGS,
        ];
      case Platform.PLATFORM_IOS:
        return [
          StreamingTabMenuKey.INFO,
          StreamingTabMenuKey.INSPECTOR,
          StreamingTabMenuKey.PROFILE,
          StreamingTabMenuKey.LOGS,
        ];
      case Platform.PLATFORM_MACOS:
      case Platform.PLATFORM_WINDOWS:
        return [StreamingTabMenuKey.INFO, StreamingTabMenuKey.PROFILE];
      default:
        return [StreamingTabMenuKey.INFO];
    }
  };

  const tabMenus = getTabMenu(device?.platform ?? Platform.UNRECOGNIZED);
  const tab = tabMenus?.find((menu) => menu === router.query.tab)
    ? (router.query.tab as StreamingTabMenuKey | undefined) ?? StreamingTabMenuKey.INFO
    : StreamingTabMenuKey.INFO;

  return (
    <TabBox>
      <ButtonWrapper>
        <TabButton isSelected={tab === StreamingTabMenuKey.INFO} onClick={() => clickTab(StreamingTabMenuKey.INFO)}>
          <InfoCircleOutlined />
          &nbsp;General
        </TabButton>
        {tabMenus.includes(StreamingTabMenuKey.INSPECTOR) && (
          <TabButton
            isSelected={tab === StreamingTabMenuKey.INSPECTOR}
            onClick={() => clickTab(StreamingTabMenuKey.INSPECTOR)}
          >
            <LuInspect />
            &nbsp;Inspector
          </TabButton>
        )}
        {tabMenus.includes(StreamingTabMenuKey.PROFILE) && (
          <TabButton
            isSelected={tab === StreamingTabMenuKey.PROFILE}
            onClick={() => clickTab(StreamingTabMenuKey.PROFILE)}
          >
            <AreaChartOutlined />
            &nbsp;Profiler
          </TabButton>
        )}
        {tabMenus.includes(StreamingTabMenuKey.LOGS) && (
          <TabButton isSelected={tab === StreamingTabMenuKey.LOGS} onClick={() => clickTab(StreamingTabMenuKey.LOGS)}>
            <CodeOutlined />
            &nbsp;Logcat
          </TabButton>
        )}
      </ButtonWrapper>

      <div style={{ height: `calc(100% - 28px)` }}>
        <TabContent isSelected={tab === StreamingTabMenuKey.INFO}>
          <DeviceStreaming.BasicMenu hideDeviceName={isCloudDevice} />
        </TabContent>
        {tabMenus.includes(StreamingTabMenuKey.INSPECTOR) && tab === StreamingTabMenuKey.INSPECTOR && (
          <TabContent isSelected={tab === StreamingTabMenuKey.INSPECTOR}>
            {device && inspector ? <DeviceStreaming.Inspector inspector={inspector} /> : null}
          </TabContent>
        )}
        {tabMenus.includes(StreamingTabMenuKey.PROFILE) && (
          <TabContent isSelected={tab === StreamingTabMenuKey.PROFILE}>
            <DeviceStreamingGraphContainer infos={runtimeInfos} />
          </TabContent>
        )}
        {tabMenus.includes(StreamingTabMenuKey.LOGS) && (
          <TabContent isSelected={tab === StreamingTabMenuKey.LOGS}>
            <DeviceStreamingLogContainer
              filterValue={logFilterValue}
              deviceLogs={deviceLogs}
              onChangeFilterValue={handleChangeFilterValue}
              isStopped={isLogStopped}
              onTogglePlay={togglePlay}
              clearLog={clearLog}
            />
          </TabContent>
        )}
      </div>
    </TabBox>
  );
};

interface Props {
  organization: OrganizationBase;
  device: DeviceBase;
  me: UserBase;
  hideDeviceSelector?: boolean;
  isCloudDevice?: boolean;
}

const LiveTesting = ({ organization, me, device, hideDeviceSelector, isCloudDevice }: Props) => {
  return (
    <DeviceStreamingLayout
      organization={organization}
      device={device}
      right={
        <MenuBox>
          <LiveTestingMenu />
        </MenuBox>
      }
      screenViewer={<LiveTestingScreenViewer />}
      userId={me.userId}
      hideDeviceSelector={hideDeviceSelector}
      isCloudDevice={isCloudDevice}
    />
  );
};

export default LiveTesting;

const MenuBox = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;

  .ant-tabs-content.ant-tabs-content-top {
    height: 100%;
  }
`;

const TabBox = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ButtonWrapper = styled.div`
  background-color: #f4f4f4;
  flex: 0 1 auto;
  height: 28px;
`;

const TabButton = styled.button<{ isSelected: boolean }>`
  display: inline-flex;
  font-size: 0.8rem;
  height: 28px;
  line-height: 1.5;
  padding: 0.2rem 0.5rem;
  align-items: center;
  background-color: ${(props) => (props.isSelected ? '#e3e3e3' : '#f4f4f4')};
  color: ${(props) => (props.isSelected ? props.theme.colorPrimary : '#000')};
  border-bottom: 2px solid ${(props) => (props.isSelected ? props.theme.colorPrimary : 'transparent')};
`;

const TabContent = styled.div<{ isSelected: boolean }>`
  display: ${(props) => (props.isSelected ? 'block' : 'none')};
  height: 100%;
  padding: 1rem;
`;
