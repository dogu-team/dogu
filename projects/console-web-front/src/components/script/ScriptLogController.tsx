import { DeviceJobLogInfo, TestLogResponse } from '@dogu-private/console';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useScriptHashRoute from '../../hooks/script/useScriptHashRoute';

import useWebSocket from '../../hooks/useWebSocket';
import AnsiLogItem from '../logs/AnsiLogItem';
import VirtualizeLogContainer from '../logs/VirtualizeLogContainer';

interface Props {
  isRunning: boolean;
}

const ScriptLogController = ({ isRunning }: Props) => {
  const router = useRouter();
  const { pipelineId, jobId, deviceJobId } = useScriptHashRoute();
  const [logs, setLogs] = useState<DeviceJobLogInfo[]>([]);
  const socketRef = useWebSocket(
    !!pipelineId && !!jobId && !!deviceJobId
      ? `/ws/live-log?organization=${router.query.orgId}&project=${router.query.pid}&pipeline=${pipelineId}&job=${jobId}&deviceJob=${deviceJobId}`
      : null,
  );

  useEffect(() => {
    setLogs([]);
    if (socketRef.current) {
      socketRef.current.onmessage = (e) => {
        const data: TestLogResponse = JSON.parse(e.data);
        setLogs((prev) => [...prev, ...data.userProjectLogs]);
      };

      socketRef.current.onclose = () => {
        console.debug('server close ws');
      };

      return () => {
        if (socketRef.current) {
          socketRef.current.close();
        }
      };
    }
  }, [pipelineId, jobId, deviceJobId]);

  if (!deviceJobId && !jobId && !pipelineId) {
    return (
      <div>
        <p>Start test</p>
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div>
        <p>Waiting for logs...</p>
      </div>
    );
  }

  return (
    <Box>
      <VirtualizeLogContainer<DeviceJobLogInfo> items={logs} renderItem={(item) => <AnsiLogItem lineNumber={item.line} log={item} />} keyExtractor={(item) => `${item.line}`} />
    </Box>
  );
};

export default ScriptLogController;

const Box = styled.div`
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
`;
