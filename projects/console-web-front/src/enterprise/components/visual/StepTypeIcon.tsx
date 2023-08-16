import { RECORD_TEST_STEP_ACTION_TYPE } from '@dogu-private/types';
import styled from 'styled-components';
import { MdOutlineKeyboard, MdOutlineTouchApp } from 'react-icons/md';

import { flexRowCenteredStyle } from '../../../styles/box';

interface Props {
  type: RECORD_TEST_STEP_ACTION_TYPE;
}

const StepTypeIcon = ({ type }: Props) => {
  switch (type) {
    case RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_CLICK:
      return (
        <IconWrapper style={{ backgroundColor: '#7bde80' }}>
          <MdOutlineTouchApp />
        </IconWrapper>
      );
    case RECORD_TEST_STEP_ACTION_TYPE.WEBDRIVER_INPUT:
      return (
        <IconWrapper>
          <MdOutlineKeyboard />
        </IconWrapper>
      );
    default:
      return null;
  }
};

export default StepTypeIcon;

const IconWrapper = styled.div`
  ${flexRowCenteredStyle}
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: #fff;
  font-size: 1rem;
  flex-shrink: 0;
`;
