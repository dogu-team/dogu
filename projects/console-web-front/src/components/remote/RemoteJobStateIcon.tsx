import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined, MinusCircleFilled, QuestionCircleOutlined, SettingOutlined, StopFilled } from '@ant-design/icons';
import { REMOTE_DEVICE_JOB_STATE } from '@dogu-private/types';

import { remoteStatusColor } from '../../utils/mapper';

interface Props {
  state: REMOTE_DEVICE_JOB_STATE;
}

const RemoveJobStateIcon = ({ state }: Props) => {
  const style = { color: remoteStatusColor[state] };

  switch (state) {
    case REMOTE_DEVICE_JOB_STATE.WAITING:
      return <LoadingOutlined spin style={style} />;
    case REMOTE_DEVICE_JOB_STATE.IN_PROGRESS:
      return <SettingOutlined spin style={style} />;
    case REMOTE_DEVICE_JOB_STATE.SUCCESS:
      return <CheckCircleFilled style={style} />;
    case REMOTE_DEVICE_JOB_STATE.FAILURE:
      return <CloseCircleFilled style={style} />;
    case REMOTE_DEVICE_JOB_STATE.CANCELLED:
    case REMOTE_DEVICE_JOB_STATE.CANCEL_REQUESTED:
      return <StopFilled style={style} />;
    case REMOTE_DEVICE_JOB_STATE.SKIPPED:
      return <MinusCircleFilled style={style} />;
    default:
      return <QuestionCircleOutlined style={style} />;
  }
};

export default RemoveJobStateIcon;
