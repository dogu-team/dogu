import { PlusCircleOutlined } from '@ant-design/icons';
import { StepSchema } from '@dogu-private/types';
import useTranslation from 'next-translate/useTranslation';
import { NodeProps } from 'reactflow';
import styled from 'styled-components';

import { flexRowSpaceBetweenStyle } from '../../../../styles/box';

export type StepGroupNodeData = {
  steps: StepSchema[];
};

const StepGroupNode = ({ data }: NodeProps<StepGroupNodeData>) => {
  const { steps } = data;
  const { t } = useTranslation('routine');

  return (
    <Box stepCount={steps.length}>
      <StyledTitle>{t('routineGuiEditorStepLabel')}</StyledTitle>
    </Box>
  );
};

export default StepGroupNode;

const Box = styled.div<{ stepCount: number }>`
  ${flexRowSpaceBetweenStyle}
  width: 368px;
  height: ${(props) => props.stepCount * 64 + 48}px;
  padding: 8px;
  border-radius: 8px;
  background-color: #4287f544;
  border: 1px solid ${(props) => props.theme.colors.gray4};
  align-items: flex-start;
  overflow-y: auto;
`;

const StyledTitle = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
`;

const StyledButton = styled.button`
  padding: 0;
  background-color: transparent;
  color: #000000;
  font-size: 1.1rem;
`;
