import { CloudLicenseBase } from '@dogu-private/console';
import { Button, ButtonProps } from 'antd';

import useModal from '../../hooks/useModal';
import UpgradePlanModal from './UpgradePlanModal';

interface Props extends Omit<ButtonProps, 'onClick'> {
  license: CloudLicenseBase;
  plans: any[];
}

const UpgradePlanButton: React.FC<Props> = ({ plans, ...props }) => {
  const [isOpen, openModal, closeModal] = useModal();

  return (
    <>
      <Button {...props} onClick={() => openModal()} />

      <UpgradePlanModal isOpen={isOpen} close={closeModal} plans={plans} />
    </>
  );
};

export default UpgradePlanButton;
