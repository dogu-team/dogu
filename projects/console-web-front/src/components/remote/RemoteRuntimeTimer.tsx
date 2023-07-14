import { REMOTE_DEVICE_JOB_STATE } from '@dogu-private/types';
import { getDateDiffAsMilliseconds, stringifyDuration } from '../../utils/date';

interface Props {
  state: REMOTE_DEVICE_JOB_STATE;
  startedAt: Date | null;
  endedAt: Date | null;
}

const RemoteRuntimeTimer = ({ state, startedAt, endedAt }: Props) => {
  switch (state) {
    case REMOTE_DEVICE_JOB_STATE.WAITING:
      return <>Waiting...</>;
    case REMOTE_DEVICE_JOB_STATE.IN_PROGRESS:
      return <>In progress</>;
    case REMOTE_DEVICE_JOB_STATE.COMPLETE:
    case REMOTE_DEVICE_JOB_STATE.FAILURE:
      return <>{!!startedAt && !!endedAt ? stringifyDuration(getDateDiffAsMilliseconds(startedAt, endedAt)) : 'Error'}</>;
    default:
      return <>Unknown</>;
  }
};

export default RemoteRuntimeTimer;
