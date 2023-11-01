import { Switch } from 'antd';
import styled from 'styled-components';
import { shallow } from 'zustand/shallow';

import useBillingPlanPurchaseStore from '../../stores/billing-plan-purchase';

interface Props {}

const BillingDurationSwitch: React.FC<Props> = () => {
  const [isAnnual, updateIsAnnual] = useBillingPlanPurchaseStore(
    (state) => [state.isAnnual, state.updateIsAnnual],
    shallow,
  );

  return (
    <SwitchWrapper>
      <Label>Monthly</Label>
      <Switch checked={isAnnual} onChange={updateIsAnnual} style={{ margin: '0 .25rem' }} />
      <Label>
        Annually <b>{`(Save up to 20%)`}</b>
      </Label>
    </SwitchWrapper>
  );
};

export default BillingDurationSwitch;

const SwitchWrapper = styled.div`
  margin: 0.5rem 0;
`;

const Label = styled.label`
  font-size: 0.8rem;

  b {
    color: ${(props) => props.theme.colorPrimary};
    font-weight 600;
  }
`;
