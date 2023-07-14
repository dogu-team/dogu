import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
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
    case REMOTE_DEVICE_JOB_STATE.COMPLETE:
      return <CheckCircleFilled style={style} />;
    case REMOTE_DEVICE_JOB_STATE.FAILURE:
      return <CloseCircleFilled style={style} />;
    default:
      return <QuestionCircleOutlined style={style} />;
  }
};

export default RemoveJobStateIcon;
