import { ClockCircleOutlined } from '@ant-design/icons';
import { CloudLicenseBase } from '@dogu-private/console';
import { Alert } from 'antd';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import useAuthStore from '../../stores/auth';
import { hasAdminPermission } from '../../utils/auth';
import { stringifyDurationAsTimer } from '../../utils/date';
import UpgradePlanButton from './UpgradePlanButton';

interface Props {
  license: CloudLicenseBase;
}

const LiveTestingFreeTierTopBanner: React.FC<Props> = ({ license }) => {
  const me = useAuthStore((state) => state.me);
  const { t } = useTranslation('billing');

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
            <UpgradePlanButton license={license} groupType="live-testing-group">
              {t('upgradePlanButtonTitle')}
            </UpgradePlanButton>
          ) : null
        }
        style={{ marginBottom: '.5rem' }}
      />
    );
  }

  return null;
};

export default LiveTestingFreeTierTopBanner;
