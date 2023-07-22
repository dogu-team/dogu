import { getRemoteDeviceJobState, RemoteDeviceJobBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import { localizeDate } from '../../utils/date';
import PlatformIcon from '../device/PlatformIcon';
import PipelineCreatedTimer from '../pipelines/PipelineCreatedTimer';
import DoguOptions from './DoguOptions';
import RemoteCreator from './RemoteCreator';
import RemoteJobStateTag from './RemoteJobStateTag';
import RemoteRuntimeTimer from './RemoteRuntimeTimer';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
  remoteDeviceJob: RemoteDeviceJobBase;
  creator: React.ReactNode;
  doguOptions: Record<string, unknown>;
}

const RemoteDeviceJobStatitics = ({ organizationId, projectId, remoteDeviceJob, doguOptions, creator }: Props) => {
  const { browserName } = doguOptions as { browserName: string | undefined; appVersion: string | undefined; browserVersion: string | undefined };

  if (!remoteDeviceJob.device) {
    return <div>Something went wrong</div>;
  }

  const state = getRemoteDeviceJobState(remoteDeviceJob);

  return (
    <Box>
      <div style={{ marginBottom: '.5rem' }}>
        <RemoteJobStateTag state={state} />
      </div>
      <FlexRow style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <StatBox>
          <StatTtile>Device Name</StatTtile>
          <StatBody>
            <p>{remoteDeviceJob.device.name}</p>
          </StatBody>
        </StatBox>
        <StatBox>
          <StatTtile>Model</StatTtile>
          <StatBody>
            <p>{remoteDeviceJob.device.modelName ? `${remoteDeviceJob.device.modelName} (${remoteDeviceJob.device.model})` : remoteDeviceJob.device.model}</p>
          </StatBody>
        </StatBox>
        <StatBox>
          <StatTtile>Platform & Version</StatTtile>
          <StatBody>
            <FlexRow>
              <PlatformIcon platform={remoteDeviceJob.device.platform} />
              &nbsp;
              {remoteDeviceJob.device.version}
            </FlexRow>
          </StatBody>
        </StatBox>
        <StatBox>
          <StatTtile>{browserName ? 'Browser' : 'App'}</StatTtile>
          <StatBody>
            <DoguOptions doguOptions={doguOptions} />
          </StatBody>
        </StatBox>
        <StatBox>
          <StatTtile>Duration</StatTtile>
          <StatBody>
            <RemoteRuntimeTimer state={state} startedAt={remoteDeviceJob.inProgressAt} endedAt={remoteDeviceJob.completedAt} />
          </StatBody>
        </StatBox>
        <StatBox>
          <StatTtile>
            Triggered <PipelineCreatedTimer createdAt={localizeDate(new Date(remoteDeviceJob.createdAt))} />
          </StatTtile>
          <StatBody>{creator}</StatBody>
        </StatBox>
      </FlexRow>
    </Box>
  );
};

export default RemoteDeviceJobStatitics;

const Box = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.main.colors.gray6};
  line-height: 1.5;
`;

const StatBox = styled.div`
  max-width: 25%;
  margin: 0 2rem 1rem 0;
`;

const StatTtile = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.gray6};
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const StatBody = styled.div`
  margin-top: 0.25rem;
`;
