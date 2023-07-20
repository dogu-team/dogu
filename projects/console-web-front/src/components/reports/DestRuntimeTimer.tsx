import { DEST_STATE } from '@dogu-private/types';

import RuntimeTimer from '../pipelines/RuntimeTimer';

interface Props {
  state: DEST_STATE;
  inProgressAt: Date | null;
  completedAt: Date | null;
}

const DestRuntimeTimer = ({ state, inProgressAt, completedAt }: Props) => {
  switch (state) {
    case DEST_STATE.PENDING:
      return <div>Waiting...</div>;
    case DEST_STATE.SKIPPED:
      return <div>Skipped</div>;
    case DEST_STATE.UNSPECIFIED:
      return <div>Unknown</div>;
    case DEST_STATE.RUNNING:
    case DEST_STATE.FAILED:
    case DEST_STATE.PASSED:
      if (inProgressAt === null) {
        return <div>Unknown</div>;
      }

      return <RuntimeTimer startDate={new Date(inProgressAt)} endDate={completedAt && new Date(completedAt)} />;
    default:
      return null;
  }
};

export default DestRuntimeTimer;
