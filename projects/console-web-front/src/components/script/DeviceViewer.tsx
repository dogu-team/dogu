import { DeviceBase } from '@dogu-private/console';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Tabs, TabsProps } from 'antd';
import Trans from 'next-translate/Trans';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

import { flexRowCenteredStyle } from 'src/styles/box';
import DeviceStreaming from '../streaming/DeviceStreaming';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { ResizedObjectInfo } from '../../types/streaming';
import ResizableLayout from '../layouts/ResizableLayout';
import useResizePreference from '../../hooks/useResizePreference';
import ScriptLogController from './ScriptLogController';
import useInspector from '../../hooks/streaming/useInspector';

interface ContentProps {
  isRunning: boolean;
}

const StreamingContent = ({ isRunning }: ContentProps) => {
  const { videoRef, loading, deviceService, device } = useDeviceStreamingContext();
  // const inspector = useDeviceInspector(videoRef ?? undefined);
  const inspector = useInspector(deviceService?.deviceInspector, device, videoRef);
  const [selectedObjectInfos, setSelectedObjectInfos] = useState<ResizedObjectInfo[]>([]);
  const { initWidth, saveWidth } = useResizePreference('project-script-inspector-width', 250);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState<string>('inspector');

  const tabs: TabsProps['items'] = [
    {
      label: t('runner-streaming:tabMenuInspector'),
      key: 'inspector',
      style: { width: '100%', height: '100%' },
      // children: loading ? null : <DeviceStreaming.Inspector inspector={inspector} selectedObjectInfos={selectedObjectInfos} updateSelectedObjectInfos={setSelectedObjectInfos} />,
      children: loading ? null : <DeviceStreaming.Inspector inspector={inspector} />,
    },
    { label: t('project-script:deviceStreamingLogMenu'), key: 'logs', children: <ScriptLogController isRunning={isRunning} />, style: { width: '100%', height: '100%' } },
  ];

  return (
    <StreamingInner ref={ref} style={{ height: 'calc(100vh - 57px - 19rem)' }}>
      <ResizableLayout
        first={
          <StyledTabs
            items={tabs}
            destroyInactiveTabPane
            activeKey={activeKey}
            onChange={(key) => {
              setActiveKey(key);
            }}
          />
        }
        firstStyle={{ height: '100%', overflow: 'hidden' }}
        last={
          // <DeviceStreaming.Video rightSidebar={loading ? null : <DeviceStreaming.Controlbar />} inspector={inspector} updateSelectedObjectInfos={setSelectedObjectInfos}>
          <DeviceStreaming.Video inspector={inspector} rightSidebar={loading ? null : <DeviceStreaming.Controlbar />}>
            {/* {activeKey === 'inspector' &&
              inspector.resizedObjectInfos?.map((item) => {
                return <PickedInspectItem key={`${item.origin.path}`} objectInfo={item} />;
              })} */}
          </DeviceStreaming.Video>
        }
        initFirstSize={initWidth}
        direction="horizontal"
        firstMaxSize={2000}
        firstMinSize={150}
        onResize={saveWidth}
      />
    </StreamingInner>
  );
};

interface Props {
  menu: React.ReactNode;
  selectedDevice: DeviceBase | undefined;
  isRunning: boolean;
}

const DeviceViewer = ({ menu, selectedDevice, isRunning }: Props) => {
  return (
    <Box>
      {menu}

      {!selectedDevice ? (
        <DeviceEmptyBox>
          <p>
            <Trans
              i18nKey="project-script:selectDeviceHintText"
              components={{ br: <br />, link: <Link href="https://docs.dogutech.io/management/project/script-test" target="_blank" /> }}
            />
          </p>
        </DeviceEmptyBox>
      ) : (
        <DeviceStreaming device={selectedDevice}>
          <StreamingContent isRunning={isRunning} />
        </DeviceStreaming>
      )}
    </Box>
  );
};

export default React.memo(DeviceViewer);

const Box = styled.div`
  display: flex;
  height: 100%;
  padding: 0.5rem;
  flex-direction: column;
`;

const DeviceEmptyBox = styled.div`
  ${flexRowCenteredStyle}
  width: 100%;
  height: 100%;
  flex-direction: column;

  p {
    line-height: 1.4;
    text-align: center;
  }
`;

const StreamingInner = styled.div`
  display: flex;
  height: 100%;
`;

const TabWraper = styled.div`
  height: 100%;
  overflow: hidden;
`;

const StyledTabs = styled(Tabs)`
  height: 100%;

  .ant-tabs-content.ant-tabs-content-top {
    height: 100%;
  }

  /* .ant-tabs-content-holder {
    height: 100%;
  }

  .ant-tabs-tabpane {
    height: 100%;
  } */
`;
