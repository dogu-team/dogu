import { CalendarOutlined } from '@ant-design/icons';
import { RemoteBase, isRemoteRunning, isRemoteDeviceJobState } from '@dogu-private/console';
import { OrganizationId, REMOTE_DEVICE_JOB_STATE } from '@dogu-private/types';
import { List, Tag } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import { listActiveNameStyle } from '../../styles/text';
import { localizeDate } from '../../utils/date';
// import MenuButton from '../buttons/MenuButton';
import PipelineCreatedTimer from '../pipelines/PipelineCreatedTimer';
import RemoteStateSummaryGraph from './RemoteStateSummaryGraph';
import DoguOptions from './DoguOptions';
import RemoteCreator from './RemoteCreator';

interface Props {
  remote: RemoteBase;
  organizationId: OrganizationId;
}

const RemoteItem = ({ remote, organizationId }: Props) => {
  const passedCount = remote.remoteDeviceJobs?.filter((rdj) => isRemoteDeviceJobState(rdj, REMOTE_DEVICE_JOB_STATE.SUCCESS)).length;
  const totalCount = remote.remoteDeviceJobs?.length;
  const isRemoteRunningState = isRemoteRunning(remote);

  return (
    <Box>
      <StretchedWrapper>
        <FlexRow>
          {!!remote.remoteDeviceJobs ? (
            <FlexRow style={{ marginRight: '1rem' }}>
              <div>
                <RemoteStateSummaryGraph remoteJobs={remote.remoteDeviceJobs} />
              </div>
              <div style={{ marginLeft: '.5rem', fontWeight: '500' }}>
                <Tag color={isRemoteRunningState ? 'blue' : passedCount === totalCount ? 'green' : passedCount === 0 ? 'error' : 'warning'}>
                  {passedCount} / {totalCount} PASSED
                </Tag>
              </div>
            </FlexRow>
          ) : (
            <Tag color="red">ERROR</Tag>
          )}

          <div>
            <Name href={`/dashboard/${organizationId}/projects/${remote.projectId}/remotes/${remote.remoteId}`}>{remote.remoteId}</Name>
            <FlexRow style={{ fontSize: '.8rem' }}>
              <FlexRow>
                Run by&nbsp;
                <RemoteCreator remote={remote} />
              </FlexRow>

              <div style={{ marginLeft: '1rem' }}>
                <DoguOptions doguOptions={remote.doguOptions} />
              </div>
            </FlexRow>
          </div>
        </FlexRow>
      </StretchedWrapper>

      <div style={{ flex: 1, marginRight: '1rem' }}>
        <Tag>{`${remote.doguOptions.runsOn}`}</Tag>
      </div>

      <InfoBox>
        <TimerBox>
          <CalendarOutlined style={{ fontSize: '1rem', marginRight: '.2rem' }} />
          <PipelineCreatedTimer createdAt={localizeDate(new Date(remote.createdAt))} />
        </TimerBox>
        <div />
        {/* <MenuButton menu={{ items: [] }} /> */}
      </InfoBox>
    </Box>
  );
};

export default RemoteItem;

const Box = styled(List.Item)``;

const StretchedWrapper = styled.div`
  flex: 3;
  margin-right: 1rem;
`;

const Name = styled(Link)`
  ${listActiveNameStyle}
  font-size: 1rem;
  font-weight: 600;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const InfoBox = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 0.75rem;
`;

const TimerBox = styled.div`
  color: ${(props) => props.theme.colors.gray6};
  /* margin-right: 1.5rem; */
`;
