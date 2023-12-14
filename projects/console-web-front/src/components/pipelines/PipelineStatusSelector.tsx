import { PIPELINE_STATUS } from '@dogu-private/types';
import { Checkbox } from 'antd';
import styled from 'styled-components';

import usePipelineFilterStore from '../../stores/pipeline-filter';
import PipelineStatusIcon from './PipelineStatusIcon';

const statusList = [
  PIPELINE_STATUS.WAITING,
  PIPELINE_STATUS.WAITING_TO_START,
  PIPELINE_STATUS.IN_PROGRESS,
  PIPELINE_STATUS.SUCCESS,
  PIPELINE_STATUS.FAILURE,
  PIPELINE_STATUS.CANCELLED,
  PIPELINE_STATUS.SKIPPED,
];

const PipelineStatusSelector = () => {
  const updateFilter = usePipelineFilterStore((state) => state.updateFilter);

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      {statusList.map((item) => {
        return (
          <StyledCheckbox
            key={`pipeline-status-${item}`}
            onChange={() => {
              updateFilter({
                status: (prev) => {
                  if (prev.includes(item)) {
                    return prev.filter((st) => st !== item);
                  }

                  return [...prev, item].sort((a, b) => a - b);
                },
              });
            }}
          >
            <PipelineStatusIcon status={item} />
          </StyledCheckbox>
        );
      })}
    </Box>
  );
};

export default PipelineStatusSelector;

const Box = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledCheckbox = styled(Checkbox)`
  margin: 0.3rem 0;
  margin-left: 0 !important;
  user-select: none;
`;
