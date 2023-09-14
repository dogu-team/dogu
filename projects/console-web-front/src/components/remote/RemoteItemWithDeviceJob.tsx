import { CalendarOutlined } from '@ant-design/icons';
import { RemoteBase } from '@dogu-private/console';
import { Collapse, List } from 'antd';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import { localizeDate } from '../../utils/date';
import PipelineCreatedTimer from '../pipelines/PipelineCreatedTimer';
import RemoteDeviceItem from './RemoteDeviceItem';
import RemoteStateSummaryGraph from './RemoteStateSummaryGraph';

interface Props {
  remote: RemoteBase;
}

const RemoteItemWithDeviceJob = ({ remote }: Props) => {
  return (
    <ItemBox>
      <StyledCollapse ghost>
        <Collapse.Panel
          key={remote.remoteId}
          header={
            <FlexRow style={{ userSelect: 'none', justifyContent: 'space-between' }}>
              <FlexRow style={{ marginRight: '.5rem' }}>
                <div style={{ marginRight: '.3rem' }}>
                  <RemoteStateSummaryGraph remoteJobs={remote.remoteDeviceJobs} />
                </div>
                <div>{remote.remoteId}</div>
              </FlexRow>
              <div>
                <CalendarOutlined style={{ fontSize: '1rem', marginRight: '.2rem' }} />
                <PipelineCreatedTimer createdAt={localizeDate(new Date(remote.createdAt))} />
              </div>
            </FlexRow>
          }
        >
          <DeviceJobBox>
            <TitleWrapper>
              <Title>Remote device jobs</Title>
            </TitleWrapper>
            <StyledList>
              {remote.remoteDeviceJobs?.map((job) => <RemoteDeviceItem key={job.remoteId} remoteJob={job} />)}
            </StyledList>
          </DeviceJobBox>
        </Collapse.Panel>
      </StyledCollapse>
    </ItemBox>
  );
};

export default RemoteItemWithDeviceJob;

const ItemBox = styled(List.Item)`
  padding: 0 !important;
`;

const StyledCollapse = styled(Collapse)`
  width: 100%;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const DeviceJobBox = styled.div`
  padding-left: 1rem;
`;

const TitleWrapper = styled.div`
  margin-bottom: 0.5rem;
`;

const Title = styled.p`
  font-size: 1rem;
  font-weight: 500;
`;

const StyledList = styled(List)`
  padding-left: 1rem;
  border-left: 2px solid ${(props) => props.theme.main.colors.gray5};
`;
