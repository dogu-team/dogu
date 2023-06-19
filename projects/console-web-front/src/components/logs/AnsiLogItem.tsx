import { Log } from '@dogu-tech/common';
import Convert from 'ansi-to-html';
import styled from 'styled-components';

import LogItem from './LogItem';

interface Props {
  lineNumber: number;
  lineNumberComponent?: React.ReactNode;
  log: Log;
  selected?: boolean;
}

const AnsiLogItem = ({ lineNumber, log, selected, lineNumberComponent }: Props) => {
  return (
    <LogItem
      lineNumber={lineNumber}
      log={<StyledLog dangerouslySetInnerHTML={{ __html: new Convert({ fg: '#000', bg: '#fff', newline: true }).toHtml(log.message) }} />}
      selected={selected}
      lineNumberComponent={lineNumberComponent}
    />
  );
};

export default AnsiLogItem;

const StyledLog = styled.span`
  white-space: pre-wrap;
`;
