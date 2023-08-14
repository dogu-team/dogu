import { RecordTestStepBase } from '@dogu-private/console';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { MdOutlineTouchApp } from 'react-icons/md';
import styled from 'styled-components';

import { flexRowCenteredStyle } from '../../../styles/box';

interface Props {
  index: number;
  step: RecordTestStepBase;
}

const StepPreview = ({ step, index }: Props) => {
  const router = useRouter();
  const isSelected = (index === 0 && !router.query.step) || router.query.step === step.recordTestStepId;

  return (
    <Button
      onClick={() => {
        router.replace({ query: { ...router.query, step: step.recordTestStepId } }, undefined, { shallow: true });
      }}
    >
      <IconWrapper>
        <MdOutlineTouchApp />
      </IconWrapper>
      <ImageWrapper isSelected={isSelected}>
        <Image src={step.screenshotUrl} fill sizes="256px" quality={10} alt={step.recordTestStepId} style={{ objectFit: 'contain' }} />
      </ImageWrapper>
    </Button>
  );
};

export default StepPreview;

const Button = styled.button`
  width: 100%;
  margin: 8px 0;
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

const ImageWrapper = styled.div<{ isSelected: boolean }>`
  position: relative;
  margin-left: 0.5rem;
  flex: 1;
  padding-top: 100%;
  border: 3px solid ${(props) => (props.isSelected ? props.theme.colorPrimary : 'transparent')};
  border-radius: 0.35rem;
`;
