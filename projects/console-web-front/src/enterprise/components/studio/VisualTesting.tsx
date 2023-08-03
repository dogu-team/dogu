import { OrganizationBase, ProjectBase } from '@dogu-private/console';
import { DeviceId } from '@dogu-private/types';
import DeviceStreamingLayout from '../../../components/studio/DeviceStreamingLayout';

interface Props {
  organization: OrganizationBase;
  project: ProjectBase;
  deviceId: DeviceId;
}

const VisualTesting = ({ organization, project, deviceId }: Props) => {
  return <DeviceStreamingLayout project={project} deviceId={deviceId} right={<div>{deviceId}</div>} title="Visual Testing" />;
};

export default VisualTesting;
