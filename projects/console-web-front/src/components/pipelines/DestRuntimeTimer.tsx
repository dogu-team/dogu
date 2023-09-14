import { DestBase } from '@dogu-private/console';
import { DEST_STATE } from '@dogu-private/types';
import RuntimeTimer from './RuntimeTimer';

interface Props {
  dest: DestBase;
}

const DestRuntimeTimer = ({ dest }: Props) => {
  switch (dest.state) {
    case DEST_STATE.PENDING:
      return <div>Waiting...</div>;
    case DEST_STATE.SKIPPED:
      return <div>Skipped</div>;
    case DEST_STATE.UNSPECIFIED:
      return <div>Unknown</div>;
    case DEST_STATE.RUNNING:
    case DEST_STATE.FAILED:
    case DEST_STATE.PASSED:
      if (dest.inProgressAt === null) {
        return <div>Unknown</div>;
      }

      return (
        <RuntimeTimer
          startDate={new Date(dest.inProgressAt)}
          endDate={dest.completedAt && new Date(dest.completedAt)}
        />
      );
    default:
      return null;
  }
};

export default DestRuntimeTimer;
