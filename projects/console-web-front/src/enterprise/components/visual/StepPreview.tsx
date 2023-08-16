import { RecordTestStepBase } from '@dogu-private/console';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import DeleteStepButton from './DeleteStepButton';
import StepTypeIcon from './StepTypeIcon';

interface Props {
  index: number;
  step: RecordTestStepBase;
}

const StepPreview = ({ step, index }: Props) => {
  const router = useRouter();
  const isSelected = (index === 0 && !router.query.step) || router.query.step === step.recordTestStepId;

  return (
    <Box>
      <Button
        onClick={() => {
          router.replace({ query: { ...router.query, step: step.recordTestStepId } }, undefined, { shallow: true });
        }}
      >
        <div>
          <PageNumber>{index + 1}</PageNumber>
          <StepTypeIcon type={step.type} />
        </div>
        <ImageWrapper isSelected={isSelected}>
          <Image src={step.screenshotUrl} fill sizes="256px" quality={10} alt={step.recordTestStepId} style={{ objectFit: 'contain' }} />
        </ImageWrapper>
      </Button>

      <StepButtonWrapper>
        <DeleteStepButton step={step} />
      </StepButtonWrapper>
    </Box>
  );
};

export default StepPreview;

const StepButtonWrapper = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  display: none;
`;

const Box = styled.div`
  position: relative;

  &:hover ${StepButtonWrapper} {
    display: block;
  }
`;

const Button = styled.button`
  width: 100%;
  margin: 8px 0;
  display: flex;
  background-color: #fff;
`;

const PageNumber = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.gray5};
  margin-bottom: 0.5rem;
`;

const ImageWrapper = styled.div<{ isSelected: boolean }>`
  position: relative;
  margin-left: 0.5rem;
  flex: 1;
  padding-top: 100%;
  border: 3px solid ${(props) => (props.isSelected ? props.theme.colorPrimary : 'transparent')};
  border-radius: 0.35rem;
`;
