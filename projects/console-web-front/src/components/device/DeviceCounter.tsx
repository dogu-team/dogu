import { ArrowRightOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { GetEnabledDeviceCountResponse } from '@dogu-private/console';
import useSWR from 'swr';
import styled from 'styled-components';

import useRefresh from '../../hooks/useRefresh';
import useLicenseStore from '../../stores/license';
import { swrAuthFetcher } from '../../api';
import UpgradePlanModal from '../billing/UpgradePlanModal';
import useModal from '../../hooks/useModal';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import useTranslation from 'next-translate/useTranslation';

const DeviceCounter: React.FC = () => {
  const license = useLicenseStore((state) => state.license);
  const [isOpen, openModal, closeModal] = useModal();
  const { data: countInfo, mutate: mutateCountInfo } = useSWR<GetEnabledDeviceCountResponse>(
    !!license?.organizationId && `/organizations/${license.organizationId}/devices/count`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
    },
  );
  const updateBillingGroupType = useBillingPlanPurchaseStore((state) => state.updateBillingGroupType);
  const { t } = useTranslation();

  useRefresh(['onDeviceAdded', 'onDeviceUpdated', 'onDeviceStopped', 'onAddDeviceToProjectModalClosed'], () =>
    mutateCountInfo(),
  );

  if (!license) {
    return null;
  }

  const browserUsedCount = countInfo?.enabledBrowserCount ?? 0;
  const browserMaxCount = license.selfDeviceBrowserCount;

  const mobileUsedCount = countInfo?.enabledMobileCount ?? 0;
  const mobileMaxCount = license.selfDeviceMobileCount;

  const isBrowserMaxed = browserUsedCount >= browserMaxCount;
  const isMobileMaxed = mobileUsedCount >= mobileMaxCount;

  return (
    <>
      <FlexRow>
        <StyledText>
          {isBrowserMaxed && <ExclamationCircleOutlined style={{ color: 'red' }} />}&nbsp;Browsers: {browserUsedCount} /{' '}
          {browserMaxCount === Number.POSITIVE_INFINITY ? '∞' : browserMaxCount}
          &nbsp;&nbsp;&nbsp;{isMobileMaxed && <ExclamationCircleOutlined style={{ color: 'red' }} />}&nbsp;Devices:{' '}
          {mobileUsedCount} / {mobileMaxCount === Number.POSITIVE_INFINITY ? '∞' : mobileMaxCount}
        </StyledText>

        <div style={{ marginLeft: '.25rem' }}>
          <UpgradePlanButton
            onClick={() => {
              updateBillingGroupType('self-device-farm-group');
              openModal();
            }}
          >
            {t('billing:upgradePlanButtonTitle')} <ArrowRightOutlined />
          </UpgradePlanButton>
        </div>
      </FlexRow>

      <UpgradePlanModal isOpen={isOpen} close={closeModal} />
    </>
  );
};

export default DeviceCounter;

const FlexRow = styled.div`
  display: flex;
  align-items: center;
`;

const StyledText = styled.p`
  line-height: 1.5;
  font-size: 0.8rem;
  color: ${(props) => props.theme.main.colors.gray2};
`;

const UpgradePlanButton = styled.button`
  display: inline-block;
  color: ${(props) => props.theme.colorPrimary};
  padding: 0 0.25rem;
  background-color: #fff;

  &:hover {
    text-decoration: underline;
  }
`;
