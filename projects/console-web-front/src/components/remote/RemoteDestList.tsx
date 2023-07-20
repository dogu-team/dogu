import { LoadingOutlined } from '@ant-design/icons';
import { RemoteDestBase } from '@dogu-private/console';
import { DEST_TYPE, OrganizationId, ProjectId, RemoteDeviceJobId } from '@dogu-private/types';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import RemoteDestJob from './RemoteDestJob';
import RemoteDestUnit from './RemoteDestUnit';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
  remoteDeviceJobId: RemoteDeviceJobId;
}

const RemoteDestListController = ({ organizationId, projectId, remoteDeviceJobId }: Props) => {
  const { data, isLoading, error } = useSWR<RemoteDestBase[]>(
    `/organizations/${organizationId}/projects/${projectId}/remote-device-jobs/${remoteDeviceJobId}/remote-dests`,
    swrAuthFetcher,
  );

  if (!data && isLoading) {
    return (
      <div>
        <LoadingOutlined /> Loading...
      </div>
    );
  }

  if (!data || error) {
    return <div>Something went wrong</div>;
  }

  return (
    <div>
      {data.map((item) => {
        switch (item.type) {
          case DEST_TYPE.JOB:
            return <RemoteDestJob key={`dest-${item.remoteDestId}`} dest={item} />;
          case DEST_TYPE.UNIT:
            return <RemoteDestUnit key={`dest-${item.remoteDestId}`} dest={item} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default RemoteDestListController;
