import { MdOutlineTouchApp } from 'react-icons/md';
import styled from 'styled-components';

import { flexRowCenteredStyle } from '../../../styles/box';

interface Props {}

const StepPreview = () => {
  return (
    <Button>
      <IconWrapper>
        <MdOutlineTouchApp />
      </IconWrapper>
      <ImageWrapper>
        <p>screenshot</p>
      </ImageWrapper>
    </Button>
  );
};

export default StepPreview;

const Button = styled.button`
  margin: 0.5rem 0;
  display: flex;
  background-color: #fff;
`;

const IconWrapper = styled.div`
  ${flexRowCenteredStyle}
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #7bde80;
  color: #fff;
  font-size: 1rem;
`;

const ImageWrapper = styled.div`
  margin-left: 0.5rem;
`;
