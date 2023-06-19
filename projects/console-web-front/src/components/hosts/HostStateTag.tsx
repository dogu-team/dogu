import { HostConnectionState } from '@dogu-private/types';
import { Tag } from 'antd';

interface Props {
  state: HostConnectionState;
}

const HostStateTag = ({ state }: Props) => {
  if (state === HostConnectionState.HOST_CONNECTION_STATE_DISCONNECTED) {
    return <Tag color="error">Disconnected</Tag>;
  } else if (state === HostConnectionState.HOST_CONNECTION_STATE_CONNECTED) {
    return <Tag color="green">Connected</Tag>;
  }
  return null;
};

export default HostStateTag;
