import { CheckCircleFilled, ClockCircleFilled, ExclamationCircleFilled, MinusCircleFilled, SettingFilled, StopFilled } from '@ant-design/icons';
import { PIPELINE_STATUS } from '@dogu-private/types';
import styled from 'styled-components';

import { pipelineStatusColor, pipelineStatusText } from '../../utils/mapper';

interface Props {
  status: PIPELINE_STATUS;
}

const PipelineStatusIcon = ({ status }: Props) => {
  switch (status) {
    case PIPELINE_STATUS.SUCCESS:
      return (
        <StateBox status={status}>
          <CheckCircleFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />
          <StateText>{pipelineStatusText[status]}</StateText>
        </StateBox>
      );
    case PIPELINE_STATUS.IN_PROGRESS:
      return (
        <StateBox status={status}>
          <SettingFilled spin style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />
          <StateText>{pipelineStatusText[status]}</StateText>
        </StateBox>
      );
    case PIPELINE_STATUS.WAITING:
      return (
        <StateBox status={status}>
          <ClockCircleFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />
          <StateText>{pipelineStatusText[status]}</StateText>
        </StateBox>
      );
    case PIPELINE_STATUS.FAILURE:
      return (
        <StateBox status={status}>
          <ExclamationCircleFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />
          <StateText>{pipelineStatusText[status]}</StateText>
        </StateBox>
      );
    case PIPELINE_STATUS.CANCELLED:
      return (
        <StateBox status={status}>
          <StopFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />
          <StateText>{pipelineStatusText[status]}</StateText>
        </StateBox>
      );
    case PIPELINE_STATUS.SKIPPED:
      return (
        <StateBox status={status}>
          <MinusCircleFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />
          <StateText>{pipelineStatusText[status]}</StateText>
        </StateBox>
      );
    case PIPELINE_STATUS.CANCEL_REQUESTED:
      return (
        <StateBox status={status}>
          <StopFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />
          <StateText>{pipelineStatusText[status]}</StateText>
        </StateBox>
      );
    default:
      return null;
  }
};

export default PipelineStatusIcon;

const StateBox = styled.div<{ status: PIPELINE_STATUS }>`
  display: flex;
  padding: 4px 8px;
  border-radius: 20px;
  align-items: center;
  background-color: ${(props) => pipelineStatusColor[props.status]}33;
`;

const StateText = styled.p`
  margin-left: 0.25rem;
  font-size: 0.8rem;
`;
