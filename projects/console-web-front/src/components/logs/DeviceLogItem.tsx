import { Log } from '@dogu-tech/common';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../styles/box';

import { DeviceLogLevel } from '../../types/device';
import { deviceLogLevelColor } from '../../utils/mapper';
import LogItem from './LogItem';

interface Props {
  lineNumber: number;
  lineNumberComponent?: React.ReactNode;
  log: Log;
  selected?: boolean;
}

const DeviceLogItem = ({ lineNumber, log, selected, lineNumberComponent }: Props) => {
  const logLevel = log.message.match(/ (V|D|I|W|E|F|S) /);

  if (logLevel) {
    const levelIdx = log.message.indexOf(logLevel[0]);
    const level = logLevel[0].charAt(1) as DeviceLogLevel;
    const isError = level === 'E' || level === 'F';
    const style = deviceLogLevelColor[`${level}`];

    return (
      <LogItem
        lineNumber={lineNumber}
        log={
          <LogBox>
            <Prefix>{log.message.slice(0, levelIdx)}&nbsp;</Prefix>
            <LogLevel style={style}>{log.message.slice(levelIdx, levelIdx + 3)}</LogLevel>
            <LogText style={{ color: isError ? 'red' : '#000' }}>{log.message.slice(levelIdx + 3)}</LogText>
          </LogBox>
        }
        selected={selected}
        lineNumberComponent={lineNumberComponent}
      />
    );
  }

  return <LogItem lineNumber={lineNumber} log={<span>{log.message}</span>} lineNumberComponent={lineNumberComponent} />;
};

export default DeviceLogItem;

const LogBox = styled.div`
  display: flex;
`;

const LogInner = styled.div`
  display: flex;
`;

const Prefix = styled(LogInner)`
  width: 280px;
  flex-shrink: 0;
`;

const LogLevel = styled(LogInner)`
  flex-shrink: 0;
  padding: 0 4px;
  margin-right: 4px;
`;

const LogText = styled(LogInner)`
  flex: 1;
`;
