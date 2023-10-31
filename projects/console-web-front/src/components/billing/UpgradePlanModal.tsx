import { CloudSubscriptionPlanType } from '@dogu-private/console';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import BillingPayStep from './BillingPayStep';
import BillingSelectPlanStep from './BillingSelectPlanStep';

interface Props {
  isOpen: boolean;
  close: () => void;
  planType: CloudSubscriptionPlanType;
}

const UpgradePlanModal: React.FC<Props> = ({ isOpen, close, planType }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClickUpgrade = () => {
    setIsSelected(true);
  };

  const handleClose = () => {
    setIsSelected(false);
    close();
  };

  return (
    <Modal
      title={
        <FlexRow>
          {isSelected && (
            <Button
              icon={<ArrowLeftOutlined />}
              style={{ marginRight: '.25rem' }}
              type="ghost"
              onClick={() => setIsSelected(false)}
            />
          )}
          <p>Upgrade your plan!</p>
        </FlexRow>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnClose
    >
      {isSelected ? (
        <BillingPayStep />
      ) : (
        <BillingSelectPlanStep planType={planType} onClickUpgrade={handleClickUpgrade} />
      )}
    </Modal>
  );
};

export default UpgradePlanModal;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
