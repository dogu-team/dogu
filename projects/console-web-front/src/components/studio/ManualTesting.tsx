import { DeviceBase, OrganizationBase, ProjectBase } from '@dogu-private/console';
import { DeviceId } from '@dogu-private/types';
import useSWR from 'swr';
import { swrAuthFetcher } from '../../api/index';

import DeviceStreaming from '../streaming/DeviceStreaming';

interface Props {
  organization: OrganizationBase;
  project: ProjectBase;
  deviceId: DeviceId;
}

const ManualTesting = ({ organization, project, deviceId }: Props) => {
  const {
    data: device,
    error: deviceError,
    isLoading: deviceIsLoading,
  } = useSWR<DeviceBase>(`/organizations/${organization.organizationId}/devices/${deviceId}`, swrAuthFetcher, { revalidateOnFocus: false });

  return (
    <DeviceStreaming device={device}>
      <div>Manual testing</div>
    </DeviceStreaming>
  );
};

export default ManualTesting;
