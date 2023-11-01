import { CloudSubscriptionPlanMap, CloudSubscriptionPlanType } from '@dogu-private/console';
import styled from 'styled-components';

import { planDescriptionInfoMap } from '../../resources/plan';
import BillingDurationSwitch from './BillingDurationSwitch';
import PlanItem from './PlanItem';

interface Props {
  planType: CloudSubscriptionPlanType;
  onClickUpgrade: () => void;
  // TODO: from user's plan
  // isAnnual: boolean;
}

const BillingSelectPlanStep: React.FC<Props> = ({ planType, onClickUpgrade }) => {
  const planInfo = CloudSubscriptionPlanMap[planType];
  const descriptionInfo = planDescriptionInfoMap[planType];

  return (
    <div>
      <div>
        {/* TODO: from user's current plan */}
        <div>Your current plan: ...</div>
      </div>

      <FlexEnd>
        <BillingDurationSwitch />
      </FlexEnd>

      <PlanWrapper>
        <PlanItem planInfo={planInfo} descriptionInfo={descriptionInfo} onClickUpgrade={onClickUpgrade} />
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

const FlexEnd = styled.div`
  display: flex;
  justify-content: flex-end;
`;
