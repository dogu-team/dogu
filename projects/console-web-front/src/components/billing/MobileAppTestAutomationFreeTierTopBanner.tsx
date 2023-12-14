import { ArrowRightOutlined, ClockCircleOutlined } from '@ant-design/icons';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

import useAuthStore from '../../stores/auth';
import useLicenseStore from '../../stores/license';
import { hasAdminPermission } from '../../utils/auth';
import { isMobileAppTestAutomationFreePlan } from '../../utils/billing';
import UpgradePlanButton from './UpgradePlanButton';

interface Props {}

const MobileAppTestAutomationFreeTierTopBanner: React.FC<Props> = () => {
  const license = useLicenseStore((state) => state.license);
  const me = useAuthStore((state) => state.me);
  const { t } = useTranslation('billing');

  if (!license) {
    return null;
  }

  const isFreePlan = isMobileAppTestAutomationFreePlan(license);
  const remainingSeconds =
    license.mobileAppTestAutomationRemainingFreeSeconds < 0 ? 0 : license.mobileAppTestAutomationRemainingFreeSeconds;

  if (isFreePlan) {
    return (
      <Box>
        <span style={{ fontSize: '.85rem' }}>
          <ClockCircleOutlined /> {(remainingSeconds / 60).toFixed(0)} min{remainingSeconds > 1 ? 's' : ''} left(Cloud
          device).
        </span>
        {!!me && hasAdminPermission(me) && (
          <StyledButton type="ghost" groupType="mobile-app-test-automation-group">
            {t('upgradePlanButtonTitle')} <ArrowRightOutlined />
          </StyledButton>
        )}
      </Box>
    );
  }

  return null;
};

export default MobileAppTestAutomationFreeTierTopBanner;

const Box = styled.div`
  margin-left: 0.5rem;
  padding: 0 0.25rem;
  border-radius: 4px;
  background-color: #e6f4ff;
  border: 1px solid #91d5ff;
`;

const StyledButton = styled(UpgradePlanButton)`
  margin-left: 0.25rem;
  padding: 0 0.25rem;
  color: ${(props) => props.theme.main.colors.blue4};
`;
