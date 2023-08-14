import { RecordTestStepBase } from '@dogu-private/console';
import Image from 'next/image';
import styled from 'styled-components';

interface Props {
  step: RecordTestStepBase | undefined;
}

const StepEditor = ({ step }: Props) => {
  return (
    <Box>
      {step ? (
        <Image src={step.screenshotUrl} fill sizes="(max-width: 767px) 100vw, 33vw" quality={90} style={{ objectFit: 'contain' }} alt={step.recordTestStepId} />
      ) : (
        <div>Select step!</div>
      )}
    </Box>
  );
};

export default StepEditor;

const Box = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
