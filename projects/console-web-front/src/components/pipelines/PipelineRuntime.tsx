import { PIPELINE_STATUS } from '@dogu-private/types';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import { getDateDiffAsMilliseconds, stringifyDuration } from '../../utils/date';

interface Props {
  status: PIPELINE_STATUS;
  startedAt: Date | null;
  endedAt: Date | null;
}

const PipelineRuntime = ({ status, startedAt, endedAt }: Props) => {
  switch (status) {
    case PIPELINE_STATUS.SKIPPED:
      return <p>Skipped</p>;
    case PIPELINE_STATUS.WAITING:
      return <p>Waiting...</p>;
    case PIPELINE_STATUS.SUCCESS:
    case PIPELINE_STATUS.FAILURE:
      return (
        <p>{!!startedAt && !!endedAt ? stringifyDuration(getDateDiffAsMilliseconds(startedAt, endedAt)) : 'Error'}</p>
      );
    case PIPELINE_STATUS.CANCELLED:
      if (!!startedAt && !!endedAt) {
        return <p>{stringifyDuration(getDateDiffAsMilliseconds(startedAt, endedAt))}</p>;
      }
      return <p>Cancelled</p>;
    case PIPELINE_STATUS.IN_PROGRESS:
      return <p>In progress</p>;
    case PIPELINE_STATUS.CANCEL_REQUESTED:
      return <p>Canceling...</p>;
    default:
      return <p>Unknown</p>;
  }
};

export default PipelineRuntime;

const FlexBox = styled.div`
  ${flexRowBaseStyle}
`;
