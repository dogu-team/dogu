import { RecordTestStepResponse } from '@dogu-private/console';
import Image from 'next/image';
import styled from 'styled-components';
import { flexRowCenteredStyle } from '../../../styles/box';
import DeleteStepButton from './DeleteStepButton';

interface Props {
  step: RecordTestStepResponse | undefined;
}

const StepEditor = ({ step }: Props) => {
  return (
    <Box>
      {step ? (
        <FlexRow>
          <RelativeBox>
            <Image src={step.screenshotUrl} fill sizes="(max-width: 767px) 100vw, 33vw" quality={90} style={{ objectFit: 'contain' }} alt={step.recordTestStepId} />
          </RelativeBox>
          <MenuWrapper>
            <DeleteStepButton step={step} />
          </MenuWrapper>
        </FlexRow>
      ) : (
        <div>Select step!</div>
      )}
    </Box>
  );
};

export default StepEditor;

const Box = styled.div`
  width: 100%;
  height: 100%;
`;

const FlexRow = styled.div`
  display: flex;
  height: 100%;
`;

const MenuWrapper = styled.div`
  width: 2rem;
  margin-left: 0.5rem;
`;

const RelativeBox = styled.div`
  position: relative;
  flex: 1;
`;
