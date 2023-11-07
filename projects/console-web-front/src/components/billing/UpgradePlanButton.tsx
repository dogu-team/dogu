import { BillingSubscriptionGroupType } from '@dogu-private/console';
import { Button, ButtonProps } from 'antd';

import useModal from '../../hooks/useModal';
import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import UpgradePlanModal from './UpgradePlanModal';

interface Props extends Omit<ButtonProps, 'onClick'> {
  groupType: BillingSubscriptionGroupType | null;
}

const UpgradePlanButton: React.FC<Props> = ({ groupType, ...props }) => {
  const [isOpen, openModal, closeModal] = useModal();
  const updateBillingGroupType = useBillingPlanPurchaseStore((state) => state.updateBillingGroupType);

  const handleClick = () => {
    updateBillingGroupType(groupType);
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
