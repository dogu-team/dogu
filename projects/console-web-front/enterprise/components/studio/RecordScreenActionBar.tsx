import { Button, Tooltip } from 'antd';
import { BsFillRecordFill } from 'react-icons/bs';
import { HiCursorClick } from 'react-icons/hi';
import styled from 'styled-components';
import { flexRowCenteredStyle } from '../../../src/styles/box';

interface Props {
  isRecording: boolean;
  updateIsRecording: (isRecording: boolean) => void;
}

const RecordScreenActionBar = ({ isRecording, updateIsRecording }: Props) => {
  return (
    <Box>
      <Tooltip title="Record mode">
        <StyledButton
          icon={<BsFillRecordFill style={{ color: 'red', fontSize: '1.1rem' }} />}
          shape="circle"
          onClick={() => updateIsRecording(true)}
          type={isRecording ? 'primary' : 'default'}
        />
      </Tooltip>
      <Tooltip title="Input mode">
        <StyledButton
          icon={<HiCursorClick />}
          shape="circle"
          onClick={() => updateIsRecording(false)}
          type={!isRecording ? 'primary' : 'default'}
        />
      </Tooltip>
    </Box>
  );
};

export default RecordScreenActionBar;

const Box = styled.div`
  ${flexRowCenteredStyle}

  button:last-child {
    margin-right: 0;
  }
`;

const StyledButton = styled(Button)`
  ${flexRowCenteredStyle}
  margin-right: 0.5rem;
`;
