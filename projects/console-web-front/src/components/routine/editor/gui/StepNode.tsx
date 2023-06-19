import { StepSchema } from '@dogu-private/types';
import useTranslation from 'next-translate/useTranslation';
import { Handle, NodeProps, Position } from 'reactflow';
import styled from 'styled-components';
import { PREPARE_ACTION_NAME, RUN_TEST_ACTION_NAME } from '../../../../types/routine';

export type StepNodeData = {
  step: StepSchema;
  jobName: string;
};

const StepNode = ({ data, isConnectable }: NodeProps<StepNodeData>) => {
  const { step } = data;
  const { t } = useTranslation('routine');

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          width: '.5rem',
          height: '.5rem',
          top: '-0.25rem',
        }}
      />
      <Box>
        <StepName>{step.name}</StepName>
      </Box>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{
          width: '.5rem',
          height: '.5rem',
          bottom: '-0.25rem',
        }}
      />
    </>
  );
};

export default StepNode;

const Box = styled.div`
  width: 336px;
  height: 48px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.gray4};
  background-color: #dfdfdf88;
  line-height: 1.4;
  overflow-y: auto;
`;

const StepName = styled.div`
  font-size: 1rem;
  font-weight: 600;
`;
