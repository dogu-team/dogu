import { ClockCircleOutlined } from '@ant-design/icons';
import { CloudLicenseBase } from '@dogu-private/console';
import { Alert } from 'antd';

import UpgradePlanButton from './UpgradePlanButton';

interface Props {
  license: CloudLicenseBase;
}

const LiveTestingFreeTierTopBanner: React.FC<Props> = ({ license }) => {
  if (license.cloudSubscriptionItems?.length === 0) {
    return (
      <Alert
        type="info"
        icon={<ClockCircleOutlined />}
        showIcon
        message={<p>You&apos;re using free tier.. 180min left... Blah blah</p>}
        action={
          <UpgradePlanButton license={license} plans={[]}>
            Upgrade plan
          </UpgradePlanButton>
        }
        style={{ marginBottom: '.5rem' }}
      />
    );
  }

  return null;
};

export default LiveTestingFreeTierTopBanner;
