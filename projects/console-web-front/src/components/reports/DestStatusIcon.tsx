import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  ExclamationCircleOutlined,
  LoadingOutlined,
  MinusCircleFilled,
} from '@ant-design/icons';
import { DEST_STATE } from '@dogu-private/types';

import { destStatusColor } from '../../utils/mapper';

interface Props {
  state: DEST_STATE;
}

const DestStatusIcon = ({ state }: Props) => {
  switch (state) {
    case DEST_STATE.RUNNING:
      return <LoadingOutlined style={{ color: destStatusColor[state] }} />;
    case DEST_STATE.PASSED:
      return <CheckCircleFilled style={{ color: destStatusColor[state] }} />;
    case DEST_STATE.FAILED:
      return <CloseCircleFilled style={{ color: destStatusColor[state] }} />;
    case DEST_STATE.SKIPPED:
      return <MinusCircleFilled style={{ color: destStatusColor[state] }} />;
    case DEST_STATE.PENDING:
      return <ClockCircleFilled style={{ color: destStatusColor[state] }} />;
    default:
      return <ExclamationCircleOutlined style={{ color: destStatusColor[state] }} />;
  }
};

export default DestStatusIcon;
