import { CloudLicenseBase, BillingSubscriptionGroupType, SelfHostedLicenseBase } from '@dogu-private/console';
import { Button, ButtonProps } from 'antd';

import useModal from '../../hooks/useModal';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import UpgradePlanModal from './UpgradePlanModal';

interface Props extends Omit<ButtonProps, 'onClick'> {
  license: CloudLicenseBase | SelfHostedLicenseBase;
  groupType: BillingSubscriptionGroupType | null;
}

const UpgradePlanButton: React.FC<Props> = ({ groupType, license, ...props }) => {
  const [isOpen, openModal, closeModal] = useModal();
  const updateLicense = useBillingPlanPurchaseStore((state) => state.updateLicense);
  const updateBillingGroupType = useBillingPlanPurchaseStore((state) => state.updateBillingGroupType);

  const handleClick = () => {
    updateBillingGroupType(groupType);
    updateLicense(license);
    openModal();
  };

  return (
    <>
      <Button {...props} onClick={handleClick} />

      <UpgradePlanModal isOpen={isOpen} close={closeModal} />
    </>
  );
};

export default UpgradePlanButton;
