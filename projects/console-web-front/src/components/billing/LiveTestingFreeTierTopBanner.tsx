import { ClockCircleOutlined } from '@ant-design/icons';
import { CloudLicenseResponse } from '@dogu-private/console';
import { Alert } from 'antd';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import useAuthStore from '../../stores/auth';
import useLicenseStore from '../../stores/license';
import { hasAdminPermission } from '../../utils/auth';
import { isLiveTestingFreePlan } from '../../utils/billing';
import { stringifyDurationAsTimer } from '../../utils/date';
import UpgradePlanButton from './UpgradePlanButton';

interface Props {}

const LiveTestingFreeTierTopBanner: React.FC<Props> = () => {
  const license = useLicenseStore((state) => state.license) as CloudLicenseResponse | null;
  const me = useAuthStore((state) => state.me);
  const { t } = useTranslation('billing');

  if (!license) {
    return null;
  }

  const isFreePlan = isLiveTestingFreePlan(license);
  const remainingSeconds = license.liveTestingRemainingFreeSeconds < 0 ? 0 : license.liveTestingRemainingFreeSeconds;

  if (isFreePlan) {
    return (
      <Alert
        type="info"
        icon={<ClockCircleOutlined />}
        showIcon
        message={
          <p>
            <Trans
              i18nKey="billing:liveTestingFreeTierInfoBannerMessage"
              components={{
                time: <>{remainingSeconds / 60}</>,
              }}
            />
          </p>
        }
        action={
          me && hasAdminPermission(me) ? (
            <UpgradePlanButton groupType="live-testing-group">{t('upgradePlanButtonTitle')}</UpgradePlanButton>
          ) : null
        }
        style={{ marginBottom: '.5rem' }}
      />
    );
  }

  return null;
};

export default LiveTestingFreeTierTopBanner;
