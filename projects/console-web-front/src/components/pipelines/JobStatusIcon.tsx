import {
  CheckCircleFilled,
  ClockCircleFilled,
  ExclamationCircleFilled,
  MinusCircleFilled,
  QuestionCircleFilled,
  SettingFilled,
  StopFilled,
} from '@ant-design/icons';
import { PIPELINE_STATUS } from '@dogu-private/types';
import { pipelineStatusColor } from '../../utils/mapper';

interface Props {
  status: PIPELINE_STATUS;
}

const JobStatusIcon = ({ status }: Props) => {
  switch (status) {
    case PIPELINE_STATUS.WAITING:
      return <ClockCircleFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />;
    case PIPELINE_STATUS.IN_PROGRESS:
      return <SettingFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} spin />;
    case PIPELINE_STATUS.SUCCESS:
      return <CheckCircleFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />;
    case PIPELINE_STATUS.FAILURE:
      return <ExclamationCircleFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />;
    case PIPELINE_STATUS.CANCELLED:
      return <StopFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />;
    case PIPELINE_STATUS.SKIPPED:
      return <MinusCircleFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />;
    case PIPELINE_STATUS.CANCEL_REQUESTED:
      return <StopFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />;
    default:
      return <QuestionCircleFilled style={{ fontSize: '1.1rem', color: pipelineStatusColor[status] }} />;
  }
};

export default JobStatusIcon;
