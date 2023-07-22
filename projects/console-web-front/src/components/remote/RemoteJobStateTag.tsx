import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { REMOTE_DEVICE_JOB_STATE } from '@dogu-private/types';
import { Tag } from 'antd';
import styled from 'styled-components';

import { remoteStatusColor } from '../../utils/mapper';

interface Props {
  state: REMOTE_DEVICE_JOB_STATE;
}

const RemoveJobStateIcon = ({ state }: Props) => {
  const style = { color: remoteStatusColor[state] };

  switch (state) {
    case REMOTE_DEVICE_JOB_STATE.WAITING:
      return (
        <StyledTag icon={<LoadingOutlined spin style={style} />} color="warning">
          <Text>WAITING</Text>
        </StyledTag>
      );
    case REMOTE_DEVICE_JOB_STATE.IN_PROGRESS:
      return (
        <StyledTag icon={<SettingOutlined spin style={style} />} color="processing">
          <Text>IN PROGRESS</Text>
        </StyledTag>
      );
    case REMOTE_DEVICE_JOB_STATE.SUCCESS:
      return (
        <StyledTag icon={<CheckCircleFilled style={style} />} color="success">
          <Text>COMPLETED</Text>
        </StyledTag>
      );
    case REMOTE_DEVICE_JOB_STATE.FAILURE:
      return (
        <StyledTag icon={<CloseCircleFilled style={style} />} color="error">
          <Text>FAILED</Text>
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
