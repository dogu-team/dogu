import { OrganizationBase, ProjectBase } from '@dogu-private/console';
import { DeviceId, Platform } from '@dogu-private/types';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { Tabs, TabsProps } from 'antd';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import DeviceStreaming from '../streaming/DeviceStreaming';
import { DeviceStreamingLayoutProps } from './DeviceStreamingLayout';
import { StreamingTabMenuKey } from '../../types/streaming';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import DeviceStreamingGraphContainer from '../streaming/DeviceStreamingGraphContainer';
import useDeviceStreamingProfile from '../../hooks/streaming/useDeviceStreamingProfile';
import DeviceStreamingLogContainer from '../streaming/DeviceStreamingLogContainer';
import useDeviceLog from '../../hooks/streaming/useDeviceLog';
import ManualTestingScreenViewer from './ManualTestingScreenViewer';
// @ts-ignore
const DeviceStreamingLayout = dynamic<DeviceStreamingLayoutProps>(() => import('./DeviceStreamingLayout'), { ssr: false });

const ManualTestingMenu = () => {
  const router = useRouter();
  const { device, deviceService, inspector } = useDeviceStreamingContext();
  const runtimeInfos = useDeviceStreamingProfile(deviceService?.deviceClient, device ?? null);
  const { t } = useTranslation();
  const { deviceLogs, isLogStopped, logFilterValue, togglePlay, handleChangeFilterValue, clearLog } = useDeviceLog(deviceService?.deviceClient, device ?? null);

  const getTabMenu = (platform: Platform): TabsProps['items'] => {
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
      children: device && inspector ? <DeviceStreaming.Inspector inspector={inspector} /> : null,
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
        return [infoTab, inspectorTab, installTab, profileTab, logTab];
      case Platform.PLATFORM_IOS:
        return [infoTab, inspectorTab, installTab, profileTab, logTab];
      case Platform.PLATFORM_MACOS:
      case Platform.PLATFORM_WINDOWS:
        return [infoTab, profileTab];
      default:
        return [infoTab];
    }
  };

  const tabMenus = getTabMenu(device?.platform ?? Platform.UNRECOGNIZED);
  const tab = tabMenus?.find((menu) => menu.key === router.query.tab)
    ? (router.query.tab as StreamingTabMenuKey | undefined) ?? StreamingTabMenuKey.INFO
    : StreamingTabMenuKey.INFO;

  return (
    <Tabs
      defaultActiveKey={tab}
      items={tabMenus}
      style={{ height: '100%' }}
      destroyInactiveTabPane
      activeKey={tab}
      onChange={(key) => {
        router.push({ pathname: router.pathname, query: { ...router.query, tab: key } }, undefined, { shallow: true });
      }}
    />
  );
};

interface Props {
  organization: OrganizationBase;
  project: ProjectBase;
  deviceId: DeviceId;
}

const ManualTesting = ({ organization, project, deviceId }: Props) => {
  return (
    <DeviceStreamingLayout
      project={project}
      deviceId={deviceId}
      right={
        <MenuBox>
          <ManualTestingMenu />
        </MenuBox>
      }
      title="Manual Testing"
      screenViewer={<ManualTestingScreenViewer />}
    />
  );
};

export default ManualTesting;

const MenuBox = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;

  .ant-tabs-content.ant-tabs-content-top {
    height: 100%;
  }
`;
