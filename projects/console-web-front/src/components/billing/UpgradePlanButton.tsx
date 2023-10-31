import { CloudLicenseBase, CloudSubscriptionPlanType } from '@dogu-private/console';
import { Button, ButtonProps } from 'antd';

import useModal from '../../hooks/useModal';
import UpgradePlanModal from './UpgradePlanModal';

interface Props extends Omit<ButtonProps, 'onClick'> {
  license: CloudLicenseBase;
  planType: CloudSubscriptionPlanType;
}

const UpgradePlanButton: React.FC<Props> = ({ planType, ...props }) => {
  const [isOpen, openModal, closeModal] = useModal();

  return (
    <>
      <Button {...props} onClick={() => openModal()} />

      <UpgradePlanModal isOpen={isOpen} close={closeModal} planType={planType} />
    </>
  );
};

export default UpgradePlanButton;
