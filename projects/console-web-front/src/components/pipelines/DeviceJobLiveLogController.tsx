import { RoutineDeviceJobBase, DeviceJobLogInfo, RuntimeInfoResponse, TestLogResponse } from '@dogu-private/console';
import { Tabs, TabsProps } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import useWebSocket from '../../hooks/useWebSocket';
import { isPipelineInProgress } from '../../utils/pipeline';
import AnsiLogItem from '../logs/AnsiLogItem';
import DeviceLogItem from '../logs/DeviceLogItem';
import VirtualizeLogContainer from '../logs/VirtualizeLogContainer';

interface Props {
  deviceJob: RoutineDeviceJobBase;
}

const DeviceJobLiveLogController = ({ deviceJob }: Props) => {
  const router = useRouter();
  const [liveLogs, setLiveLogs] = useState<TestLogResponse[]>([]);
  const logSocketRef = useWebSocket(
    isPipelineInProgress(deviceJob.status)
      ? `/ws/live-log?organization=${router.query.orgId}&project=${router.query.pid}&pipeline=${router.query.pipelineId}&job=${deviceJob.routineJobId}&deviceJob=${deviceJob.routineDeviceJobId}`
      : null,
  );
  const { t } = useTranslation();
  const deviceLogRef = useRef<HTMLDivElement>(null);
  const testLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLiveLogs([]);
    if (logSocketRef.current) {
      logSocketRef.current.onmessage = (e) => {
        const data: TestLogResponse = JSON.parse(e.data);
        setLiveLogs((prev) => [...prev, data]);
      };
    }

    return () => {
      if (logSocketRef.current) {
        logSocketRef.current?.close();
      }
    };
  }, [deviceJob.routineDeviceJobId]);

  const renderDeviceLog = useCallback((item: DeviceJobLogInfo) => {
    return <DeviceLogItem lineNumber={item.line} lineNumberComponent={item.line} log={item} />;
  }, []);

  const renderTestLog = useCallback((item: DeviceJobLogInfo) => {
    return <AnsiLogItem lineNumber={item.line} lineNumberComponent={item.line} log={item} />;
  }, []);

  const extractKey = useCallback((item: DeviceJobLogInfo) => {
    return `${item.type} ${item.line}`;
  }, []);

  const deviecLogData = liveLogs.map((log) => log.deviceLogs).flat();
  const testLogData = liveLogs.map((log) => log.userProjectLogs).flat();

  const items: TabsProps['items'] = [
    {
      key: 'test-logs',
      label: t('routine:resultTabScriptLogMenuTitle'),
      children: (
        // <LogBox ref={testLogRef}>
        <VirtualizeLogContainer<DeviceJobLogInfo> items={testLogData} renderItem={renderTestLog} keyExtractor={extractKey} scrollEndOnInit maxHeight={500} scrollEndOnUpdate />
        // </LogBox>
      ),
    },
    {
      key: 'device-logs',
      label: t('routine:resultTabDeviceLogMenuTitle'),
      children: (
        // <LogBox ref={deviceLogRef}>
        <VirtualizeLogContainer<DeviceJobLogInfo> items={deviecLogData} renderItem={renderDeviceLog} keyExtractor={extractKey} scrollEndOnInit maxHeight={500} scrollEndOnUpdate />
        // </LogBox>
      ),
    },
  ];

  return (
    <Box>
      <Tabs
        defaultActiveKey="device-logs"
        items={items}
        destroyInactiveTabPane
        onChange={(key) => {
          if (key === 'device-logs') {
            setTimeout(() => {
              deviceLogRef.current?.scrollTo(0, deviceLogRef.current.scrollHeight);
            }, 3000);
          } else {
            setTimeout(() => {
              testLogRef.current?.scrollTo(0, testLogRef.current.scrollHeight);
            }, 3000);
          }
        }}
      />
    </Box>
  );
};

export default DeviceJobLiveLogController;

const Box = styled.div``;

const LogBox = styled.div`
  height: min(80vh, 500px);
  overflow-y: auto;
`;

const End = styled.div`
  width: 100%;
  height: 3px;
`;
