import { ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';
import { flexRowBaseStyle } from '../../styles/box';
import BillingPayStep from './BillingPayStep';
import BillingSelectPlanStep from './BillingSelectPlanStep';

interface Props {
  isOpen: boolean;
  close: () => void;
}

const UpgradePlanModal: React.FC<Props> = ({ isOpen, close }) => {
  const [selectedPlan, updateSelectedPlan] = useBillingPlanPurchaseStore(
    (state) => [state.selectedPlan, state.updateSelectedPlan],
    shallow,
  );
  const reset = useBillingPlanPurchaseStore((state) => state.reset);
  const { t } = useTranslation('billing');
  // const [isSelected, setIsSelected] = useState(false);

  // const handleClickUpgrade = () => {
  //   setIsSelected(true);
  // };

  const handleClose = () => {
    close();
    setTimeout(() => {
      reset();
    }, 500);
  };

  return (
    <Modal
      title={
        <FlexRow style={{ justifyContent: 'space-between' }}>
          <FlexRow>
            {!!selectedPlan && (
              <Button
                icon={<ArrowLeftOutlined />}
                style={{ marginRight: '.25rem' }}
                type="text"
                onClick={() => updateSelectedPlan(null)}
              />
            )}
            <p>{t('upgradePlanModalTitle')}</p>
          </FlexRow>
          <Button icon={<CloseOutlined />} type="text" style={{ marginLeft: '.25rem' }} onClick={handleClose} />
        </FlexRow>
      }
      open={isOpen}
      closable={false}
      footer={null}
      centered
      destroyOnClose
      width="min(80vw, 720px)"
    >
      {!!selectedPlan ? <BillingPayStep /> : <BillingSelectPlanStep />}
    </Modal>
  );
};

export default UpgradePlanModal;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
