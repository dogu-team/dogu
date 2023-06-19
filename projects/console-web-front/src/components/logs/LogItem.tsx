import styled from 'styled-components';
import { flexRowBaseStyle } from '../../styles/box';

interface Props {
  lineNumber: number;
  lineNumberComponent?: React.ReactNode;
  log?: React.ReactNode;
  selected?: boolean;
}

const LogItem = ({ lineNumber, log, selected, lineNumberComponent }: Props) => {
  return (
    <Box selected={selected} id={selected ? 'selected-log' : undefined} data-index={lineNumber}>
      <StyledNumber>{lineNumberComponent ?? lineNumber}</StyledNumber>
      <StyledLog>{log}</StyledLog>
    </Box>
  );
};

export default LogItem;

const Box = styled.div<{ selected?: boolean }>`
  ${flexRowBaseStyle}
  padding: .125rem 0;
  ${(props) => (props.selected ? `background-color: ${props.theme.colorPrimary}44` : '')};
  align-items: flex-start;
  line-height: 1.2;
  font-size: 0.8rem;
  font-family: monospace;
  align-items: flex-start;
`;

const StyledNumber = styled.b`
  width: 48px;
  flex-shrink: 0;
  align-self: stretch;
  margin-right: 0.75rem;
  text-align: right;
  user-select: none;
`;

const StyledLog = styled.p`
  word-break: break-all;
  user-select: auto;
`;
