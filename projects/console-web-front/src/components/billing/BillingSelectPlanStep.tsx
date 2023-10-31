import { CloudSubscriptionPlanMap, CloudSubscriptionPlanType } from '@dogu-private/console';
import { Switch } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';

import { planDescriptionInfoMap } from '../../resources/plan';
import PlanItem from './PlanItem';

interface Props {
  planType: CloudSubscriptionPlanType;
  onClickUpgrade: () => void;
  // TODO: from user's plan
  // isAnnual: boolean;
}

const BillingSelectPlanStep: React.FC<Props> = ({ planType, onClickUpgrade }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const planInfo = CloudSubscriptionPlanMap[planType];
  const descriptionInfo = planDescriptionInfoMap[planType];

  return (
    <div>
      <div>
        {/* TODO: from user's current plan */}
        <div>Your current plan: ...</div>
      </div>
      <SwitchWrapper>
        <Label>Monthly</Label>
        <Switch checked={isAnnual} onChange={setIsAnnual} style={{ margin: '0 .25rem' }} />
        <Label>
          Annually <b>{`(Save up to 20%)`}</b>
        </Label>
      </SwitchWrapper>

      <PlanWrapper>
        <PlanItem
          planInfo={planInfo}
          descriptionInfo={descriptionInfo}
          onClickUpgrade={onClickUpgrade}
          isAnnual={isAnnual}
        />
      </PlanWrapper>
    </div>
  );
};

export default BillingSelectPlanStep;

const PlanWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

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
