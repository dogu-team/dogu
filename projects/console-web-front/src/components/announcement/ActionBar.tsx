import styled from 'styled-components';
import Image from 'next/image';

import { flexRowCenteredStyle } from '../../styles/box';
import resources from '../../resources';

const ActionBar = () => {
  return (
    <Box>
      <IconWrapper style={{ left: 'calc(50% - 60px)' }}>
        <Image src={resources.icons.smilingFace} fill alt="smile" />
      </IconWrapper>
      <IconWrapper style={{ left: 'calc(50% - 12px)' }}>
        <Image src={resources.icons.neutralFace} fill alt="neutral" />
      </IconWrapper>
      <IconWrapper style={{ left: 'calc(50% + 36px)' }}>
        <Image src={resources.icons.pensiveFace} fill alt="pensive" />
      </IconWrapper>
    </Box>
  );
};

export default ActionBar;

const Box = styled.div`
  height: 28px;
  position: relative;
  ${flexRowCenteredStyle}
  align-items: flex-end;
`;

const IconWrapper = styled.div`
  position: absolute;
  width: 28px;
  height: 28px;
  top: 0;
`;
