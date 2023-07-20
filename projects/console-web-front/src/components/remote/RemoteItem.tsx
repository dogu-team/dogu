import { CalendarOutlined } from '@ant-design/icons';
import { RemoteBase, isRemoteRunning } from '@dogu-private/console';
import { CREATOR_TYPE, OrganizationId, REMOTE_DEVICE_JOB_STATE } from '@dogu-private/types';
import { List, Tag } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';

import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
import { listActiveNameStyle } from '../../styles/text';
import { localizeDate } from '../../utils/date';
import MenuButton from '../buttons/MenuButton';
import PipelineCreatedTimer from '../pipelines/PipelineCreatedTimer';
import RemoteStateSummaryGraph from './RemoteStateSummaryGraph';
import DoguOptions from './DoguOptions';
import RoutineCreator from '../routine/editor/RoutineCreator';
import RemoteCreator from './RemoteCreator';

interface Props {
  remote: RemoteBase;
  organizationId: OrganizationId;
}

const RemoteItem = ({ remote, organizationId }: Props) => {
  const passedCount = remote.remoteDeviceJobs?.filter((rdj) => rdj.state === REMOTE_DEVICE_JOB_STATE.COMPLETE).length;
  const totalCount = remote.remoteDeviceJobs?.length;

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
                <Tag
                  color={isRemoteRunning(remote.remoteDeviceJobs.map((rdj) => rdj.state)) ? 'blue' : passedCount === totalCount ? 'green' : passedCount === 0 ? 'error' : 'warning'}
                >
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

      <div style={{ marginLeft: '2rem' }}>
        <Tag>{`${remote.doguOptions.runsOn}`}</Tag>
      </div>

      <InfoBox>
        <TimerBox>
          <CalendarOutlined style={{ fontSize: '1rem', marginRight: '.2rem' }} />
          <PipelineCreatedTimer createdAt={localizeDate(new Date(remote.createdAt))} />
        </TimerBox>
        <MenuButton menu={{ items: [] }} />
      </InfoBox>
    </Box>
  );
};

export default RemoteItem;

const Box = styled(List.Item)``;

const StretchedWrapper = styled.div`
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
  ${flexRowSpaceBetweenStyle}
  font-size: 0.75rem;
`;

const TimerBox = styled.div`
  color: ${(props) => props.theme.colors.gray6};
  margin-right: 1.5rem;
`;
