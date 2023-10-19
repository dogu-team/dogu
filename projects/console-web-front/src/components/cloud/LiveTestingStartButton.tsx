import { DeviceBase, DeviceUsageState } from '@dogu-private/console';
import { Button, ButtonProps } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

import { isCloudDeviceAvailable } from '../../utils/device';

interface Props extends ButtonProps {
  device: Pick<DeviceBase, 'usageState' | 'connectionState'>;
}

const LiveTestingStartButton: React.FC<Props> = ({ device, ...props }) => {
  const isAvailable = isCloudDeviceAvailable(device);
  const { t } = useTranslation('cloud-device');

  return (
    <Button type="primary" {...props} disabled={!isAvailable}>
      {isAvailable ? (
        t('cloudDeviceListStartButtonTitle')
      ) : device.usageState === DeviceUsageState.PREPARING ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Dot style={{ backgroundColor: '#f7d282' }} />
          {t('cloudDeviceListPrepareButtonTitle')}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Dot style={{ backgroundColor: '#f97651' }} />
          {t('cloudDeviceListBusyButtonTitle')}
        </div>
      )}
    </Button>
  );
};

export default LiveTestingStartButton;

const Dot = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 0.5rem;
`;
