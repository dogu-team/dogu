import { RemoteDestBase } from '@dogu-private/console';

import DestUnit from '../reports/DestUnit';

interface Props {
  dest: RemoteDestBase;
}

const RemoteDestUnit = ({ dest }: Props) => {
  return <DestUnit state={dest.state} name={dest.name} startedAt={dest.inProgressAt} endedAt={dest.completedAt} />;
};

export default RemoteDestUnit;
