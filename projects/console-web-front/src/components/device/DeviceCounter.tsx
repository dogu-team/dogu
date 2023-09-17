import { useDeviceCount } from '../../../enterprise/api/device';
import useOrganizationContext from '../../hooks/context/useOrganizationContext';
import useRefresh from '../../hooks/useRefresh';

const DeviceCounter: React.FC = () => {
  const { organization } = useOrganizationContext();
  const { data: countInfo, mutate: mutateCountInfo } = useDeviceCount();

  useRefresh(['onDeviceAdded', 'onDeviceUpdated'], () => mutateCountInfo());

  if (!organization) {
    return null;
  }

  return (
    <p>
      Browser runners: {countInfo?.enabledBrowserCount} / {organization.licenseInfo?.licenseTier?.enabledBrowserCount}
      &nbsp;&nbsp;&nbsp;Devices: {countInfo?.enabledMobileCount} /{' '}
      {organization.licenseInfo?.licenseTier?.enabledMobileCount}
    </p>
  );
};

export default DeviceCounter;
