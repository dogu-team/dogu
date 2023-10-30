import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Modal, Switch } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import PlanItem from './PlanItem';
import BillingPayStep from './BillingPayStep';

interface Props {
  isOpen: boolean;
  close: () => void;
  plans: any[];
}

const UpgradePlanModal: React.FC<Props> = ({ isOpen, close }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClickUpgrade = () => {
    setIsSelected(true);
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
      onCancel={close}
      footer={null}
      centered
      destroyOnClose
    >
      {isSelected ? (
        <BillingPayStep />
      ) : (
        <div>
          <div>
            <div>Your current plan: ...</div>
          </div>
          <div>
            <label>Monthly</label>
            <Switch />
            <label>
              Annually <b>{`(Save up to 20%)`}</b>
            </label>
          </div>

          <PlanWrapper>
            <PlanItem onClickUpgrade={handleClickUpgrade} />
          </PlanWrapper>
        </div>
      )}
    </Modal>
  );
};

export default UpgradePlanModal;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const PlanWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;
