import { RecordTestStepBase } from '@dogu-private/console';
import Image from 'next/image';
import { MdOutlineTouchApp } from 'react-icons/md';
import styled from 'styled-components';

import { flexRowCenteredStyle } from '../../../styles/box';

interface Props {
  step: RecordTestStepBase;
}

const StepPreview = ({ step }: Props) => {
  return (
    <Button>
      <IconWrapper>
        <MdOutlineTouchApp />
      </IconWrapper>
      <ImageWrapper>
        <Image src={step.screenshotUrl} fill alt={step.recordTestStepId} style={{ objectFit: 'contain' }} />
      </ImageWrapper>
    </Button>
  );
};

export default StepPreview;

const Button = styled.button`
  width: 100%;
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
  flex-shrink: 0;
`;

const ImageWrapper = styled.div`
  position: relative;
  margin-left: 0.5rem;
  flex: 1;
  padding-top: 100%;
  border: 1px solid #e5e5e5;
  border-radius: 0.25rem;
`;
