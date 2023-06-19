import { ClockCircleOutlined, MinusCircleOutlined, StopOutlined } from '@ant-design/icons';
import { PIPELINE_STATUS } from '@dogu-private/types';
import styled from 'styled-components';

import { flexRowCenteredStyle } from '../../styles/box';
import { pipelineStatusColor } from '../../utils/mapper';

interface Props {
  status: PIPELINE_STATUS;
  title: string;
}

const PipelineEmptyLog = ({ status, title }: Props) => {
  const iconStyle: React.CSSProperties = { fontSize: '2.5rem', color: pipelineStatusColor[status] };

  switch (status) {
    case PIPELINE_STATUS.WAITING:
      return (
        <Box>
          <ClockCircleOutlined style={iconStyle} />
          <p>{title}</p>
        </Box>
      );
    case PIPELINE_STATUS.CANCELLED:
      return (
        <Box>
          <StopOutlined style={iconStyle} />
          <p>{title}</p>
        </Box>
      );
    case PIPELINE_STATUS.SKIPPED:
      return (
        <Box>
          <MinusCircleOutlined style={iconStyle} />
          <p>{title}</p>
        </Box>
      );
    case PIPELINE_STATUS.CANCEL_REQUESTED:
      return (
        <Box>
          <StopOutlined style={iconStyle} />
          <p>{title}</p>
        </Box>
      );
    default:
      return null;
  }
};

export default PipelineEmptyLog;

const Box = styled.div`
  height: 200px;
  ${flexRowCenteredStyle}
  flex-direction: column;

  p {
    margin-top: 1rem;
    font-weight: 500;
  }
`;
