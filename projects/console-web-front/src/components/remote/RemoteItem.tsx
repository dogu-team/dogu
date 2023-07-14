import { RemoteBase } from '@dogu-private/console';
import { Collapse, List } from 'antd';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../styles/box';
import RemoteStateSummaryGraph from './RemoteStateSummaryGraph';

interface Props {
  remote: RemoteBase;
}

const RemoteItem = ({ remote }: Props) => {
  return (
    <ItemBox>
      <StyledCollapse ghost>
        <Collapse.Panel
          key={remote.remoteId}
          header={
            <FlexRow style={{ userSelect: 'none' }}>
              <RemoteStateSummaryGraph remoteJobs={remote.remoteDeviceJobs} />
              <div>{remote.remoteId}</div>
            </FlexRow>
          }
        >
          <DeviceJobBox>
            <div>Remote device jobs</div>
            {remote.remoteDeviceJobs?.map((job) => (
              <div key={job.remoteDeviceJobId}>
                <div>{job.state}</div>
                <div>{job.device?.name}</div>
              </div>
            ))}
          </DeviceJobBox>
        </Collapse.Panel>
      </StyledCollapse>
    </ItemBox>
  );
};

export default RemoteItem;

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
