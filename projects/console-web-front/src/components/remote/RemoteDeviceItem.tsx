import { CalendarOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { RemoteDeviceJobBase } from '@dogu-private/console';
import { List } from 'antd';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../styles/box';
import { localizeDate } from '../../utils/date';
import PlatformIcon from '../device/PlatformIcon';
import PipelineCreatedTimer from '../pipelines/PipelineCreatedTimer';
import PipelineRuntime from '../pipelines/PipelineRuntime';
import RemoteJobStateIcon from './RemoteJobStateIcon';
import RemoteRuntimeTimer from './RemoteRuntimeTimer';

interface Props {
  remoteJob: RemoteDeviceJobBase;
}

const RemoteDeviceItem = ({ remoteJob }: Props) => {
  if (!remoteJob.device) return null;

  return (
    <Item key={remoteJob.remoteDeviceJobId}>
      <FlexRow style={{ flex: 2 }}>
        <RemoteJobStateIcon state={remoteJob.state} />
        <p style={{ marginLeft: '.25rem' }}>{remoteJob.device?.name}</p>
        <div style={{ marginLeft: '1.5rem' }}>
          <FlexRow>
            <PlatformIcon platform={remoteJob.device.platform} />
            {remoteJob.device.version}
          </FlexRow>
          <div>
            <p>
              {remoteJob.device.modelName} {`(${remoteJob.device.model})`}
            </p>
          </div>
        </div>
      </FlexRow>
      <div style={{ flex: 2 }}></div>
      <FlexColumnEnd style={{ flex: 1 }}>
        <p style={{ textAlign: 'right' }}>
          <CalendarOutlined style={{ fontSize: '1rem', marginRight: '.2rem' }} />
          <PipelineCreatedTimer createdAt={localizeDate(new Date(remoteJob.createdAt))} />
        </p>
        <p style={{ textAlign: 'right' }}>
          <FieldTimeOutlined style={{ fontSize: '1rem', marginRight: '.2rem' }} />
          <RemoteRuntimeTimer
            state={remoteJob.state}
            startedAt={remoteJob.inProgressAt && new Date(remoteJob.inProgressAt)}
            endedAt={remoteJob.completedAt && new Date(remoteJob.completedAt)}
          />
        </p>
      </FlexColumnEnd>
    </Item>
  );
};

export default RemoteDeviceItem;

const Item = styled(List.Item)`
  ${flexRowBaseStyle}
  justify-content: flex-start !important;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const FlexColumnEnd = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;
