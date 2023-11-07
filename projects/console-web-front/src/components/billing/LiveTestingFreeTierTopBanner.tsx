import { ClockCircleOutlined } from '@ant-design/icons';
import { CloudLicenseBase } from '@dogu-private/console';
import { Alert } from 'antd';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import useAuthStore from '../../stores/auth';
import useLicenseStore from '../../stores/license';
import { hasAdminPermission } from '../../utils/auth';
import { stringifyDurationAsTimer } from '../../utils/date';
import UpgradePlanButton from './UpgradePlanButton';

interface Props {}

const LiveTestingFreeTierTopBanner: React.FC<Props> = () => {
  const license = useLicenseStore((state) => state.license) as CloudLicenseBase | null;
  const me = useAuthStore((state) => state.me);
  const { t } = useTranslation('billing');

  if (!license) {
    return null;
  }

  if (!license.billingOrganization?.billingSubscriptionPlanInfos?.length) {
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
                time: <>{stringifyDurationAsTimer(license.liveTestingRemainingFreeSeconds * 1000)}</>,
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
