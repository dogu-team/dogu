import { TestLogResponse } from '@dogu-private/console';
import { DeviceJobLogInfo } from '@dogu-private/console';
import Link from 'next/link';
import { useCallback } from 'react';
import styled from 'styled-components';
import { Url } from 'url';

import AnsiLogItem from '../logs/AnsiLogItem';
import DeviceLogItem from '../logs/DeviceLogItem';
import VirtualizeLogContainer from '../logs/VirtualizeLogContainer';

interface Props {
  logs: TestLogResponse;
  logType: keyof TestLogResponse;
  selectedLine?: number;
  getLineLink: (item: DeviceJobLogInfo) => string | Partial<Url>;
}

const LogContainer = ({ logs, logType, selectedLine, getLineLink }: Props) => {
  const renderItem = useCallback(
    (item: DeviceJobLogInfo) => {
      if (logType === 'deviceLogs') {
        return <DeviceLogItem lineNumber={item.line} lineNumberComponent={<LineLink href={getLineLink(item)} scroll={false} selected={selectedLine === item.line}>{item.line}</LineLink>} log={item} selected={selectedLine === item.line} />;
      }

      if (logType === 'userProjectLogs') {
        return <AnsiLogItem lineNumber={item.line} lineNumberComponent={<LineLink href={getLineLink(item)} scroll={false} selected={selectedLine === item.line}>{item.line}</LineLink>} log={item} selected={selectedLine === item.line} />;
      }

      return null;
    },
    [logType, getLineLink, selectedLine],
  );

  const extractKey = useCallback((item: DeviceJobLogInfo) => `${item.line}`, []);

  const filteredLogs = logs[logType];

  if (filteredLogs.length === 0) {
    return <div>There is no log.</div>;
  }

  return (
    <div>
      <VirtualizeLogContainer<DeviceJobLogInfo> items={filteredLogs} renderItem={renderItem} keyExtractor={extractKey} selectedLine={selectedLine} />
    </div>
  );
};

export default LogContainer;

const LineLink = styled(Link)<{selected: boolean}>`
  display: block;
  height: 100%;
  color: ${(props) => (props.selected ? props.theme.colorPrimary : '#000')};
`;
