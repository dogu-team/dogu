import { RemoteBase, RoutinePipelineBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import { DashboardBox, DashboardTitle } from './dashboard.styled';

interface Props {
  latestTests: (RoutinePipelineBase | RemoteBase)[];
}

const LatestTestsBoard: React.FC<Props> = ({ latestTests }) => {
  return (
    <DashboardBox>
      <DashboardTitle>Latest Tests</DashboardTitle>
      {latestTests.map((test) => {
        if ('routineId' in test) {
          return (
            <div key={test.routinePipelineId}>
              {test.routine?.name} {test.index}
            </div>
          );
        } else {
          return <div key={test.remoteId}>{test.remoteId}</div>;
        }
      })}
    </DashboardBox>
  );
};

export default LatestTestsBoard;

export const OrganizationLatestTestsBoard: React.FC<{ organizationId: OrganizationId }> = ({ organizationId }) => {
  const { data, isLoading, error } = useSWR<(RoutinePipelineBase | RemoteBase)[]>(
    `/organizations/${organizationId}/latest-tests`,
    swrAuthFetcher,
  );

  if (!data) {
    return null;
  }

  return <LatestTestsBoard latestTests={data} />;
};
