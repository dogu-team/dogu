import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { REMOTE_DEVICE_JOB_STATE } from '@dogu-private/types';
import { Tag } from 'antd';
import styled from 'styled-components';

import { remoteStatusColor } from '../../utils/mapper';
import RemoteJobStateIcon from './RemoteJobStateIcon';

interface Props {
  state: REMOTE_DEVICE_JOB_STATE;
}

const RemoveJobStateIcon = ({ state }: Props) => {
  const style = { color: remoteStatusColor[state] };

  const icon = <RemoteJobStateIcon state={state} />;

  switch (state) {
    case REMOTE_DEVICE_JOB_STATE.WAITING:
      return (
        <StyledTag icon={icon} color="warning">
          <Text>WAITING</Text>
        </StyledTag>
      );
    case REMOTE_DEVICE_JOB_STATE.IN_PROGRESS:
      return (
        <StyledTag icon={icon} color="processing">
          <Text>IN PROGRESS</Text>
        </StyledTag>
      );
    case REMOTE_DEVICE_JOB_STATE.SUCCESS:
      return (
        <StyledTag icon={icon} color="success">
          <Text>COMPLETED</Text>
        </StyledTag>
      );
    case REMOTE_DEVICE_JOB_STATE.FAILURE:
      return (
        <StyledTag icon={icon} color="error">
          <Text>FAILED</Text>
        </StyledTag>
      );
    case REMOTE_DEVICE_JOB_STATE.CANCELLED:
      return (
        <StyledTag icon={icon} color="default">
          <Text>CANCELLED</Text>
        </StyledTag>
      );
    case REMOTE_DEVICE_JOB_STATE.SKIPPED:
      return (
        <StyledTag icon={icon} color="default">
          <Text>SKIPPED</Text>
        </StyledTag>
      );
    case REMOTE_DEVICE_JOB_STATE.CANCEL_REQUESTED:
      return (
        <StyledTag icon={icon} color="default">
          <Text>CANCEL REQUESTED</Text>
        </StyledTag>
      );
    default:
      return (
        <StyledTag icon={<QuestionCircleOutlined style={style} />} color="error">
          <Text>UNKNOWN</Text>
        </StyledTag>
      );
  }
};

export default RemoveJobStateIcon;

const StyledTag = styled(Tag)`
  display: inline-flex;
  align-items: center;
`;

const Text = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
`;
